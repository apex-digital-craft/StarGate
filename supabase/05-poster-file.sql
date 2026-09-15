-- STARGATE slice 5: founder-designed custom posters. Paste-run in Supabase dashboard → SQL Editor.
-- Safe to re-run. Requires a public Storage bucket named `posters`
-- (create in Dashboard → Storage → New bucket → Public ON) before uploads work.
-- A custom design per merchant is stored at `posters/{slug}/{timestamp}.{ext}`;
-- the plain auto-generated QR PDF stays as the fallback download.

alter table merchants
  add column if not exists poster_image_url text;

-- ---------- Storage RLS for the `posters` bucket ----------
-- Public read so owners can download their design with no extra login hops.
-- Writes are denied to anon/authenticated; uploads go through the
-- service-role server route `POST /api/admin/poster-upload`.

drop policy if exists "public read posters" on storage.objects;
create policy "public read posters"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'posters');
