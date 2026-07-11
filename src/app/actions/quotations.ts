"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getEnquiryById, markEnquiryQuoted } from "@/lib/data/enquiries";
import { getRateCardById, toEngineRateCard } from "@/lib/data/rate-cards";
import { createQuotationRecord, attachQuotationPdf } from "@/lib/data/quotations";
import { calculateQuotation } from "@/lib/quotation/engine";
import { renderQuotationPdf } from "@/lib/pdf/render-quotation-pdf";

const generateQuotationSchema = z.object({
  enquiryId: z.string().uuid(),
  rateCardId: z.string().uuid(),
  role: z.string().trim().min(1, "Role is required"),
  nos: z.coerce.number().int().positive(),
  targetTakeHome: z.coerce.number().positive(),
  gstPct: z.coerce.number().min(0).max(100),
  serviceChargePctOverride: z
    .union([z.coerce.number().min(0).max(100), z.literal("")])
    .optional()
    .transform((value) => (value === "" || value === undefined ? undefined : value)),
});

export async function generateQuotationAction(formData: FormData) {
  const parsed = generateQuotationSchema.safeParse({
    enquiryId: formData.get("enquiryId"),
    rateCardId: formData.get("rateCardId"),
    role: formData.get("role"),
    nos: formData.get("nos"),
    targetTakeHome: formData.get("targetTakeHome"),
    gstPct: formData.get("gstPct"),
    serviceChargePctOverride: formData.get("serviceChargePctOverride"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((issue) => issue.message).join(", "));
  }

  const input = parsed.data;

  const [enquiry, rateCardRow] = await Promise.all([
    getEnquiryById(input.enquiryId),
    getRateCardById(input.rateCardId),
  ]);

  const engineRateCard = toEngineRateCard(rateCardRow);

  const result = calculateQuotation(
    {
      gstPct: input.gstPct,
      lines: [
        {
          role: input.role,
          nos: input.nos,
          targetTakeHome: input.targetTakeHome,
          serviceChargePctOverride: input.serviceChargePctOverride,
        },
      ],
    },
    engineRateCard
  );

  const quotation = await createQuotationRecord({
    enquiryId: input.enquiryId,
    rateCardId: input.rateCardId,
    result,
  });

  const pdfBuffer = await renderQuotationPdf({
    clientName: enquiry.clients?.company_name ?? "Client",
    clientAddress: enquiry.clients?.address ?? null,
    requirementSummary: enquiry.requirement_summary,
    zone: rateCardRow.zone,
    skillCategory: rateCardRow.skill_category,
    generatedAt: quotation.generated_at,
    result,
  });

  const pdfPath = `${quotation.id}.pdf`;
  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("quotation-pdfs")
    .upload(pdfPath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  await attachQuotationPdf(quotation.id, pdfPath);
  await markEnquiryQuoted(input.enquiryId);

  redirect(`/quotations/${quotation.id}`);
}
