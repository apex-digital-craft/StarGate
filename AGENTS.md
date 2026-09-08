# AGENTS.md — STARGATE

Greenfield repo. No code scaffolded yet (only planning docs, `main` has 0 commits).
Source of truth: `STARGATE-MVP-PLAN.md` (derived from `business model.md`). Trust the plan over anything else.

## What we're building
Review-gating micro-SaaS for local SMBs. Flow: QR scan → `/s/[slug]` 1–5 star tap → 1–3 stars = private feedback + Telegram alert + freebie, 4–5 stars = Google Review CTA + freebie. Freebie is URL-only in V1 (no uploads).

## Planned stack (do not substitute)
- Next.js App Router + TypeScript + Tailwind on Vercel, Supabase Postgres, Telegram Bot API.
- Scaffold: `npx create-next-app@latest stargate --typescript --tailwind --app`
- Deps: `@supabase/supabase-js`, `qrcode`, `jspdf`, `qrcode.react`

## Data model (Supabase)
- `merchants(id uuid, slug text unique, shop_name, google_review_url, freebie_url, freebie_title, telegram_chat_id, brand_color?, logo_url?, created_at)` — all routes resolve from `slug` (lowercase, e.g. `cafe-aroma-kochi`).
- `feedbacks(id, merchant_id fk, rating 1-5, feedback_text?, created_at)`
- `review_clicks(id, merchant_id fk, created_at)`
- RLS: public SELECT `merchants` by slug, public INSERT `feedbacks`/`review_clicks`, deny rest. Seed one `slug=test-cafe`.
- Build order: Data + Funnel → Telegram + Freebie → QR PDF + Onboarding.

## Routes / entrypoints to create
- `app/s/[slug]/page.tsx` — mobile-first, <2s load, 404 on bad slug. Star switch 1–3 → `FeedbackForm`, 4–5 → `GoogleReviewCTA`.
- `POST /api/feedback {slug, rating, text}` → insert → server-side Telegram `sendMessage` (`⭐N | shop + text + time`). Failure rule: Telegram failure must still save + still unlock freebie, log error only.
- `POST /api/review-click {slug}` fire-and-forget → `window.open(google_review_url)` → reveal freebie immediately (no review verification in V1).
- `app/admin/poster/[slug]/page.tsx` + `/admin` — gated by `?key=ADMIN_SECRET`. Admin creates merchant (auto-slugify), lists counts, links poster, copies QR URL. Poster QR encodes `${BASE_URL}/s/${slug}`, A4 high-contrast, `poster-{slug}.pdf` via `qrcode` dataURL + `jspdf`.

## Env (Vercel + local)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_SECRET`. No auth in V1 beyond `ADMIN_SECRET`.

## V1 simplifications — keep them
- Telegram linking is manual: merchant sends "hi" to bot → founder `GET api.telegram.org/bot<TOKEN>/getUpdates` → paste `chat.id` into `telegram_chat_id`. No webhook (`t.me/bot?start=slug` is V2, skip).
- Rate-limit `/api/feedback` 10/min/IP in-memory; validate rating 1–5 + slug exists; sanitize text for Telegram.

## Verify
No test/lint harness yet. When code exists: manual QA = §4 of `STARGATE-MVP-PLAN.md` (9 phone checks: good/bad/empty rating, gift link, QR scan at 2–3 ft, new-shop creation, <1 min end-to-end with Telegram <10s). Pass = all 9 green; failures in 3/5/9 block pilot.
