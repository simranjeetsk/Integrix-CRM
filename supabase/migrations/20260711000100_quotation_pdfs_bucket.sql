-- Storage bucket for generated quotation PDFs (spec Section 2: Supabase Storage).
insert into storage.buckets (id, name, public)
values ('quotation-pdfs', 'quotation-pdfs', false)
on conflict (id) do nothing;

create policy "authenticated users can read quotation pdfs"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'quotation-pdfs');

create policy "authenticated users can upload quotation pdfs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'quotation-pdfs');

create policy "authenticated users can update quotation pdfs"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'quotation-pdfs')
  with check (bucket_id = 'quotation-pdfs');
