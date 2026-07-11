-- Placeholder seed data for local development.
--
-- IMPORTANT: the basic/DA figures below are ILLUSTRATIVE PLACEHOLDERS, not
-- confirmed Maharashtra minimum wage notification values. Spec Section 8,
-- item 1, calls out that Zone II/III Skilled basic wage figures must be
-- confirmed against the official notification before any quotation is used
-- with a real client. Replace these rows via the rate card management
-- screen (Phase 1 feature) once confirmed.

insert into public.rate_cards (
  zone, skill_category, basic, da, hra_pct,
  pf_employee_pct, pf_employer_pct,
  esic_employee_pct, esic_employer_pct, esic_ceiling,
  bonus_pct, mlwf_employer, professional_tax, service_charge_pct,
  effective_from
) values
  ('Zone I', 'Unskilled', 9017, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone I', 'Semi-Skilled', 9938, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone I', 'Skilled', 10928, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone II', 'Unskilled', 8735, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone II', 'Semi-Skilled', 9634, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone II', 'Skilled', 10589, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone III', 'Unskilled', 8453, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone III', 'Semi-Skilled', 9330, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01'),
  ('Zone III', 'Skilled', 10251, 0, 5, 12, 13, 0.75, 3.25, 21000, 8.33, 3, 200, 10, '2026-01-01');

insert into public.clients (company_name, address, stage)
values ('Sample Client Pvt Ltd', '123 Business Park, Mumbai', 'enquiry');
