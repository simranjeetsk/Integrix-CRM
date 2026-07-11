"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createEnquiryRecord } from "@/lib/data/enquiries";

export async function createEnquiryAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const source = String(formData.get("source") ?? "").trim();
  const requirementSummary = String(
    formData.get("requirementSummary") ?? ""
  ).trim();

  if (!clientId) {
    throw new Error("Client is required");
  }

  const enquiry = await createEnquiryRecord({
    clientId,
    source: source || undefined,
    requirementSummary: requirementSummary || undefined,
  });

  revalidatePath("/enquiries");
  redirect(`/enquiries/${enquiry.id}`);
}
