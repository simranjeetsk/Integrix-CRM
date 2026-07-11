import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { RateCard } from "@/lib/quotation/engine";

export async function listActiveRateCards() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rate_cards")
    .select("*")
    .is("effective_to", null)
    .order("zone")
    .order("skill_category");

  if (error) throw error;
  return data;
}

export async function getRateCardById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rate_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export function toEngineRateCard(row: {
  id: string;
  zone: string;
  skill_category: string;
  basic: number;
  da: number;
  hra_pct: number;
  pf_employee_pct: number;
  pf_employer_pct: number;
  esic_employee_pct: number;
  esic_employer_pct: number;
  esic_ceiling: number;
  bonus_pct: number;
  mlwf_employer: number;
  professional_tax: number;
  service_charge_pct: number;
}): RateCard {
  return {
    id: row.id,
    zone: row.zone,
    skillCategory: row.skill_category,
    basic: row.basic,
    da: row.da,
    hraPct: row.hra_pct,
    pfEmployeePct: row.pf_employee_pct,
    pfEmployerPct: row.pf_employer_pct,
    esicEmployeePct: row.esic_employee_pct,
    esicEmployerPct: row.esic_employer_pct,
    esicCeiling: row.esic_ceiling,
    bonusPct: row.bonus_pct,
    mlwfEmployer: row.mlwf_employer,
    professionalTax: row.professional_tax,
    serviceChargePct: row.service_charge_pct,
  };
}
