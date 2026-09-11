-- STARGATE slice 2: owner accounts. Paste-run in Supabase dashboard → SQL Editor.
-- Safe to re-run. Existing anon policies (PHASE 2) are untouched.

-- ---------- owner link ----------
alter table merchants
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists feedbacks_merchant_created
  on feedbacks (merchant_id, created_at desc);

-- ---------- owner RLS (authenticated only; anon rules unchanged) ----------
-- Owners read their own shop row.
drop policy if exists "owner read own merchant" on merchants;
create policy "owner read own merchant"
  on merchants for select
  to authenticated
  using (auth.uid() = owner_id);

-- Owners update their own shop row. Slug changes are blocked app-side
-- (dashboard never sends slug); a slug edit would break printed QRs.
drop policy if exists "owner update own merchant" on merchants;
create policy "owner update own merchant"
  on merchants for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Owners read only their own feedback.
drop policy if exists "owner read own feedbacks" on feedbacks;
create policy "owner read own feedbacks"
  on feedbacks for select
  to authenticated
  using (
    exists (
      select 1 from merchants m
      where m.id = feedbacks.merchant_id
        and m.owner_id = auth.uid()
    )
  );

-- Owners read only their own review clicks.
drop policy if exists "owner read own review_clicks" on review_clicks;
create policy "owner read own review_clicks"
  on review_clicks for select
  to authenticated
  using (
    exists (
      select 1 from merchants m
      where m.id = review_clicks.merchant_id
        and m.owner_id = auth.uid()
    )
  );
