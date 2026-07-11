import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listEnquiries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, clients(company_name)")
    .order("received_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEnquiryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select("*, clients(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEnquiryRecord(input: {
  clientId: string;
  source?: string;
  requirementSummary?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      client_id: input.clientId,
      source: input.source,
      requirement_summary: input.requirementSummary,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function markEnquiryQuoted(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ status: "quoted" })
    .eq("id", id);

  if (error) throw error;
}
