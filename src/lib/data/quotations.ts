import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { QuotationResult } from "@/lib/quotation/engine";

export async function getQuotationById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotations")
    .select(
      "*, quotation_lines(*), rate_cards(*), enquiries(*, clients(*))"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function listQuotationsForEnquiry(enquiryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("enquiry_id", enquiryId)
    .order("generated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createQuotationRecord(input: {
  enquiryId: string;
  rateCardId: string;
  result: QuotationResult;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quotation, error: quotationError } = await supabase
    .from("quotations")
    .insert({
      enquiry_id: input.enquiryId,
      rate_card_id: input.rateCardId,
      gst_pct: input.result.gstPct,
      total_manpower_cost: input.result.totalManpowerCost,
      total_cost_to_company: input.result.totalCostToCompany,
      created_by: user?.id,
    })
    .select("*")
    .single();

  if (quotationError) throw quotationError;

  const { error: linesError } = await supabase.from("quotation_lines").insert(
    input.result.lines.map((line) => ({
      quotation_id: quotation.id,
      role: line.role,
      nos: line.nos,
      cost_per_no: line.costPerNo,
      line_total: line.lineTotal,
    }))
  );

  if (linesError) throw linesError;

  return quotation;
}

export async function attachQuotationPdf(quotationId: string, path: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotations")
    .update({ pdf_path: path })
    .eq("id", quotationId);

  if (error) throw error;
}
