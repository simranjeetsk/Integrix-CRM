-- Core schema for Phase 1 slice: clients, enquiries, rate_cards, quotations.
-- Ported from Integrix_CRM_Technical_Spec.md, Section 3.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  address text,
  stage text not null default 'enquiry'
    check (stage in ('enquiry', 'discovery', 'proposal', 'onboarding', 'execution', 'review')),
  owner_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on column public.clients.stage is 'Drives the Kanban pipeline board (Phase 1 follow-up); not used by this slice yet.';

-- ---------------------------------------------------------------------------
-- enquiries
-- ---------------------------------------------------------------------------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  source text,
  requirement_summary text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'quoted', 'closed')),
  received_at timestamptz not null default now()
);

create index enquiries_client_id_idx on public.enquiries (client_id);

-- ---------------------------------------------------------------------------
-- rate_cards
-- Versioned: never edited in place. A new VDA notification inserts a new row
-- with a fresh effective_from date, and the previous row is closed off with
-- an effective_to date. Quotations store the exact rate_card_id used so
-- historical PDFs never drift (spec Section 3.2).
-- ---------------------------------------------------------------------------
create table public.rate_cards (
  id uuid primary key default gen_random_uuid(),
  zone text not null,
  skill_category text not null,
  basic numeric(12, 2) not null,
  da numeric(12, 2) not null default 0,
  hra_pct numeric(5, 2) not null default 5,
  pf_employee_pct numeric(5, 2) not null default 12,
  pf_employer_pct numeric(5, 2) not null default 13,
  esic_employee_pct numeric(5, 2) not null default 0.75,
  esic_employer_pct numeric(5, 2) not null default 3.25,
  esic_ceiling numeric(12, 2) not null default 21000,
  bonus_pct numeric(5, 2) not null default 8.33,
  mlwf_employer numeric(12, 2) not null default 12.50,
  professional_tax numeric(12, 2) not null default 200,
  service_charge_pct numeric(5, 2) not null default 10,
  effective_from date not null,
  effective_to date,
  created_at timestamptz not null default now(),
  check (effective_to is null or effective_to >= effective_from)
);

create index rate_cards_zone_skill_idx on public.rate_cards (zone, skill_category, effective_from desc);

-- Only one currently-effective (effective_to is null) rate card per zone/skill.
create unique index rate_cards_one_active_per_zone_skill
  on public.rate_cards (zone, skill_category)
  where effective_to is null;

-- ---------------------------------------------------------------------------
-- quotations
-- ---------------------------------------------------------------------------
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  rate_card_id uuid not null references public.rate_cards (id),
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  gst_pct numeric(5, 2) not null default 18,
  total_manpower_cost numeric(14, 2) not null default 0,
  total_cost_to_company numeric(14, 2) not null default 0,
  generated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  pdf_path text
);

create index quotations_enquiry_id_idx on public.quotations (enquiry_id);

-- ---------------------------------------------------------------------------
-- quotation_lines
-- ---------------------------------------------------------------------------
create table public.quotation_lines (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  role text not null,
  nos integer not null check (nos > 0),
  cost_per_no numeric(14, 2) not null,
  line_total numeric(14, 2) not null
);

create index quotation_lines_quotation_id_idx on public.quotation_lines (quotation_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Phase 1 slice: any authenticated user has full access. Role-based access
-- (Partner/Admin vs Sales vs Ops, Section 6) is not implemented yet.
-- ---------------------------------------------------------------------------
alter table public.clients enable row level security;
alter table public.enquiries enable row level security;
alter table public.rate_cards enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_lines enable row level security;

create policy "authenticated users can manage clients"
  on public.clients for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage enquiries"
  on public.enquiries for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage rate_cards"
  on public.rate_cards for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage quotations"
  on public.quotations for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated users can manage quotation_lines"
  on public.quotation_lines for all
  to authenticated
  using (true)
  with check (true);
