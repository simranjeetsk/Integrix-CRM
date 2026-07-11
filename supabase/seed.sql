-- Rate card seed data effective 1 Jan 2026, per Maharashtra minimum wage
-- notification (Basic + DA) and current statutory rates, verified against
-- the Integrix Driver CTC Calculator workbook:
--   HRA 5% of Basic+DA
--   PF employee 12%; PF employer as 3 separately-rounded sub-components:
--     EPF employer 12% + EDLI 0.5% + Admin 0.5%
--   ESIC employee 0.75%, ESIC employer 3.25%, ceiling Rs 21,000
--     (tested against Basic+DA, not gross)
--   Statutory Bonus 8.33% of Basic+DA
--   MLWF employer Rs 12.50/month flat
--   Professional Tax Rs 200/month flat (editable per rate card)
--   Service Charge 10% (editable per rate card)
--   GST 18% (editable per quotation)

insert into public.rate_cards (
  zone, skill_category, basic, da, hra_pct,
  pf_employee_pct, pf_employer_epf_pct, pf_employer_edli_pct, pf_employer_admin_pct,
  esic_employee_pct, esic_employer_pct, esic_ceiling,
  bonus_pct, mlwf_employer, professional_tax, service_charge_pct,
  effective_from
) values
  ('Zone I', 'Skilled', 11632, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone I', 'Semi-Skilled', 10856, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone I', 'Unskilled', 10021, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone II', 'Skilled', 11632, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone II', 'Semi-Skilled', 10260, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone II', 'Unskilled', 9425, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone III', 'Skilled', 11632, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone III', 'Semi-Skilled', 9664, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01'),
  ('Zone III', 'Unskilled', 8828, 3900, 5, 12, 12, 0.5, 0.5, 0.75, 3.25, 21000, 8.33, 12.50, 200, 10, '2026-01-01');

insert into public.clients (company_name, address, stage)
values ('Sample Client Pvt Ltd', '123 Business Park, Mumbai', 'enquiry');
