-- STARGATE slice 4: instant freebie file downloads. Paste-run in Supabase dashboard → SQL Editor.
-- Safe to re-run. Requires a public Storage bucket named `freebies`
-- (create in Dashboard → Storage → New bucket → Public ON) before uploads work.
-- An uploaded PDF per merchant is stored at `freebies/{slug}/{timestamp}.pdf`;
-- `freebie_url` stays as the legacy Drive/link fallback.

alter table merchants
  add column if not exists freebie_file_url text;

-- ---------- Storage RLS for the `freebies` bucket ----------
-- Public read so scanners can download instantly with no login.
-- Writes are denied to anon/authenticated; uploads go through the
-- service-role server route `POST /api/admin/freebie-upload`.

drop policy if exists "public read freebies" on storage.objects;
create policy "public read freebies"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'freebies');
