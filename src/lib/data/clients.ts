import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function listClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getClientById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createClientRecord(input: {
  companyName: string;
  address?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ company_name: input.companyName, address: input.address })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
