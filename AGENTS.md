# AGENTS.md — STARGATE

Live product (not greenfield): review-gating SaaS at `https://star-gate-nine.vercel.app`
(Vercel, auto-deploys from `main`). Source of truth for origins: `STARGATE-MVP-PLAN.md`;
for operations: `MAINTENANCE.md`; sales/onboarding: `SALES.md`, `ONBOARDING.md`.

## What it is
QR scan → `/s/[slug]` 1–5 star tap → 1–3 stars = private feedback + Telegram alert + freebie,
4–5 stars = Google Review CTA + freebie. Freebie is URL-only (no uploads).
Marketing site (`/`, `/features`, `/pricing`, `/demo`, `/contact`) + owner app
(Google login → `/dashboard` stats/inbox/settings/trends/poster + QR card) +
founder `/admin` (`?key=ADMIN_SECRET`).

## Stack (do not substitute)
- Next.js 16 App Router (Turbopack) + TypeScript + Tailwind v4 on Vercel, Supabase Postgres + Auth, Telegram Bot API.
- Deps: `@supabase/supabase-js`, `@supabase/ssr`, `qrcode`, `jspdf`, `qrcode.react` (+ `@types/qrcode` dev).
- Auth: Supabase Google OAuth; session refresh in `proxy.ts` (NOT `middleware.ts` — deprecated in v16).
- Design: indigo brand tokens in `app/globals.css` (`bg-brand-600`), light-only theme, amber reserved for stars/gifts, green for WhatsApp/success.

## Data model (Supabase, migrations in `supabase/` in order)
- `merchants(id, slug unique lowercase, shop_name, google_review_url, freebie_url, freebie_title, telegram_chat_id, brand_color?, logo_url?, owner_id? → auth.users, poster_downloaded_at?, created_at)` — all routes resolve from `slug`.
- `feedbacks(id, merchant_id fk cascade, rating 1-5, feedback_text?, created_at)` + index `(merchant_id, created_at)`.
- `review_clicks(id, merchant_id fk cascade, created_at)`.
- RLS: anon SELECT `merchants` + INSERT `feedbacks`/`review_clicks`, deny rest; authenticated owners SELECT/UPDATE own merchant + SELECT own feedbacks/clicks only. Service role bypasses (server use only). Seed `slug=test-cafe`.

## Routes / entrypoints
- `app/s/[slug]/page.tsx` (force-dynamic, async `params`, `notFound()` on bad slug) + `RatingFlow` (`?demo=1` = no-write demo mode via `useSearchParams`+`<Suspense>`) → `FeedbackForm` / `GoogleReviewCTA` / `FreebieUnlock`.
- `POST /api/feedback {slug, rating, text}` — validate 1–5 + slug, 10/min/IP in-memory limit, service-role insert, Telegram `sendMessage`. Failure rule: Telegram failure still saves + still unlocks, log only. `telegram_chat_id` never leaves the server.
- `POST /api/review-click {slug}` fire-and-forget ROI log (client reveals gift regardless).
- `POST /api/admin/merchants` (create, auto-slugify) + `PUT|DELETE /api/admin/merchants/[slug]` (edit; slug rename + delete need typed confirm) + `POST /api/admin/claim {slug, owner_email}` (assign/unassign owner) — all `ADMIN_SECRET`-gated.
- `PUT /api/shop` (owner edits own shop; slug/chat-id founder-only) + `POST /api/shop/poster-touch`.
- `/admin` (create/list/counts/poster links/copy/claim/edit/delete) + `/admin/poster/[slug]` (QR dataURL via `qrcode` → `jspdf` A4 `poster-{slug}.pdf`).

## Env (`.env.local` gitignored + Vercel)
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Config),
`SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `ADMIN_SECRET` (Secret),
`NEXT_PUBLIC_BASE_URL` (Config). Browser code must use literal
`process.env.NEXT_PUBLIC_*` (dynamic `process.env[name]` does NOT inline).
Vercel env change → redeploy to take effect.

## Verify
`npm run lint` (0 errors; known `<img>` warnings for external/dataURL images) +
`npm run build` green. Manual QA = §4 of `STARGATE-MVP-PLAN.md` (9 phone checks).
DB checks via service-role REST; `Content-Range: */0` = clean. Test rows must be
deleted after every verify; beware PowerShell `@($null).Count -eq 1` and `%`-wildcard
double-encoding in `like` filters — prefer exact `eq` deletes.

## Living-doc rule (binding on every session)
This file and `MAINTENANCE.md` must stay true as the product changes:
- Any change to infra, data model, env vars, auth, vendors, routes, or pricing
  must update the affected lines here AND the matching section in `MAINTENANCE.md`
  **in the same change**. Never leave them stale.
- Manual dashboard clicks (Vercel/Supabase/Google consoles) bypass git — when the
  user reports one, reconcile both docs immediately.
- Keep this file compact: every line must earn its place (would an agent miss this
  without help?). Details belong in `MAINTENANCE.md`, not here.
- `MAINTENANCE.md` is split: Part 1 founder routines (keep jargon-free, verb-first
  steps naming exact buttons/pages) + Part 2 technical appendix (keep exactly true).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
