-- STARGATE V1 schema (plan steps 9-13). Paste-run in Supabase dashboard → SQL Editor.
-- Safe to re-run: tables use IF NOT EXISTS, policies are dropped first, seed is ON CONFLICT DO NOTHING.

-- ---------- tables ----------
create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug = lower(slug)),
  shop_name text not null,
  google_review_url text not null,
  freebie_url text not null,
  freebie_title text not null,
  telegram_chat_id text not null,
  brand_color text,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  feedback_text text,
  created_at timestamptz not null default now()
);

create table if not exists review_clicks (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- RLS: public SELECT merchants, public INSERT feedbacks/review_clicks, deny rest ----------
alter table merchants enable row level security;
alter table feedbacks enable row level security;
alter table review_clicks enable row level security;

drop policy if exists "public read merchants" on merchants;
create policy "public read merchants"
  on merchants for select
  to anon
  using (true);

drop policy if exists "public insert feedbacks" on feedbacks;
create policy "public insert feedbacks"
  on feedbacks for insert
  to anon
  with check (true);

drop policy if exists "public insert review_clicks" on review_clicks;
create policy "public insert review_clicks"
  on review_clicks for insert
  to anon
  with check (true);

-- ---------- seed (replace telegram_chat_id via manual linking, plan PHASE 6) ----------
insert into merchants (slug, shop_name, google_review_url, freebie_url, freebie_title, telegram_chat_id)
values (
  'test-cafe',
  'Test Cafe',
  'https://www.google.com/maps/search/?api=1&query=test+cafe',
  'https://example.com/freebie',
  'Free Chai',
  ''
)
on conflict (slug) do nothing;
