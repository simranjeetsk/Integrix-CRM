# Integrix CRM

Enquiry management and quotation engine for Integrix Facility Services LLP.
Scaffolded from `Integrix_CRM_Technical_Spec.md`, Sections 2-4.

## What's in this slice

This is a deliberately narrow first cut: **create an enquiry, generate a
quotation, download the branded PDF.** Everything else in the spec's
Phase 1-4 feature list (Kanban board, documents, tasks, staff deployments,
invoicing, dashboards, etc.) is intentionally not built yet.

Included:

- Next.js 16 (App Router, TypeScript, Tailwind) + Supabase (Postgres, Auth,
  Storage), per Section 2.
- Core schema (`clients`, `enquiries`, `rate_cards`, `quotations`,
  `quotation_lines`) per Section 3, with RLS enabled (any authenticated user
  has full access for now — the Partner/Sales/Ops role split in Section 6
  isn't implemented yet).
- The quotation engine (`src/lib/quotation/engine.ts`), ported from Section
  4's step-by-step description, with a Vitest unit-test suite.
- Email/password auth (Supabase Auth) with a `proxy.ts` that redirects
  unauthenticated requests to `/login`.
- UI: clients list/create, enquiries list/create/detail, a quotation
  generation form, and a quotation detail page.
- Branded PDF generation via `@react-pdf/renderer`, stored in a private
  Supabase Storage bucket and streamed back through
  `/api/quotations/[id]/pdf`.

### Deliberate deviation from the spec: PDF generation

Section 2 names `docx` + LibreOffice headless for document generation,
reusing the CTC Calculator build's pipeline. That works for a
long-running server but is awkward on Vercel's serverless functions (no
LibreOffice binary, cold-start cost of spinning one up). This slice uses
`@react-pdf/renderer` instead — it renders PDFs directly in Node with no
external binary. If you need the exact DOCX templates from other stages of
the client lifecycle (Phase 2), that's the point to revisit this decision.

## Prerequisites

- Node.js 20.9+
- A Supabase project ([supabase.com](https://supabase.com)) — the free tier
  is enough to start
- The Supabase CLI (`npx supabase ...`, no global install needed)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your Supabase project's
   URL and anon key (Project Settings → API):

   ```bash
   cp .env.example .env.local
   ```

3. Link the Supabase CLI to your project and push the schema:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

   This runs the migrations in `supabase/migrations/`, which create the
   core tables, RLS policies, and the private `quotation-pdfs` storage
   bucket.

4. Seed placeholder rate card data (see warning below) and a sample client:

   ```bash
   npx supabase db execute --file supabase/seed.sql
   ```

5. Create a user to log in with, either via the Supabase dashboard
   (Authentication → Users → Add user) or:

   ```bash
   npx supabase auth users create you@example.com --password <password>
   ```

6. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`, sign in, create a client, log an enquiry
   against it, then generate a quotation and download the PDF.

## Important: rate card figures are placeholders

`supabase/seed.sql` ships illustrative basic/DA figures, **not** confirmed
Maharashtra minimum wage notification values. Spec Section 8 (Open
Decisions), item 1, calls out that Zone II/III Skilled basic wage figures
need confirmation against the official notification, and item 2 calls out
that the ESIC applicability logic needs sign-off from a CA/labour law
consultant. The quotation engine (`src/lib/quotation/engine.ts`) applies
ESIC directly off Basic+DA against the wage ceiling (not gross) per current
guidance, but that guidance itself still needs confirmation, so **do not use
this for a real client quotation until both are confirmed.**

## Scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build
npm run lint      # ESLint
npm run test      # Vitest (quotation engine unit tests)
```

## Project layout

```
src/
  app/
    (app)/                 # authenticated routes (nav + sign out)
      clients/
      enquiries/
        [id]/
          quote/new/       # quotation generation form
      quotations/[id]/     # quotation detail + PDF download
    actions/                # auth + quotation server actions
    api/quotations/[id]/pdf/ # streams the stored PDF from Storage
    login/
  lib/
    quotation/engine.ts     # the ported quotation engine + engine.test.ts
    pdf/                    # @react-pdf/renderer document + renderer
    data/                   # Supabase data access per table
    supabase/               # browser/server clients, proxy session refresh
  proxy.ts                  # Next.js 16 Proxy (formerly Middleware)
supabase/
  migrations/               # schema + RLS + storage bucket
  seed.sql                  # placeholder rate cards + sample client
```

## Next steps (not in this slice)

Per the spec's Phase 1 list, in rough order: rate card management screen
(add/edit versions through the UI instead of SQL), Kanban pipeline board,
role-based access (Partner/Sales/Ops), then Phase 2's document generation,
tasks, and staff deployment tracking.
