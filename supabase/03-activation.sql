-- STARGATE slice A: activation checklist. Paste-run in Supabase dashboard → SQL Editor.
-- Safe to re-run. No RLS change: the existing owner-update policy covers the new column.

alter table merchants
  add column if not exists poster_downloaded_at timestamptz;
