"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClientRecord } from "@/lib/data/clients";

export async function createClientAction(formData: FormData) {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  if (!companyName) {
    throw new Error("Company name is required");
  }

  await createClientRecord({
    companyName,
    address: address || undefined,
  });

  revalidatePath("/clients");
  redirect(`/clients`);
}
