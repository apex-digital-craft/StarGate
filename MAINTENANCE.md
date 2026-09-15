# STARGATE — Maintenance Guide

How to keep the product alive and healthy for years. Companion docs:
`ONBOARDING.md` (per-shop setup), `SALES.md` (closing shops),
`STARGATE-MVP-PLAN.md` (original build plan).

> **Founder: Part 1 is yours. Part 2 is the AI's — you never need to read
> past the line that says so.**

---

# PART 1 — YOUR ROUTINES (plain words, no background needed)

## Every Monday — 15-minute health check

Open these 3 pages. Healthy means what it says under each one.

**Page 1: Vercel → your project → Deployments.**
You should see: the top entry says “Ready” with today’s/recent date.
If you see “Failed”: click it → the log usually ends with a missing setting
name → add it under Settings → Environment Variables → hit Redeploy. If the
log means nothing to you, screenshot it for your next AI session.

**Page 2: Supabase → your project → Usage.**
You should see: bars well below the free limits (database around 500MB cap,
bandwidth per the numbers shown there).
If a bar is nearly full: tell your next AI session “Supabase X is nearly
full” before it breaks — that’s a paid-tier conversation, never a surprise.

**Page 3: Vercel → your project → Logs.**
You should see: normal traffic, no red. Search for the word `failed`.
If lines like “telegram alert failed” appear often: alerts are struggling —
the feedback itself is still saved (nothing is lost), but tell your next AI
session so it gets fixed. Occasional single lines are normal.

## Every month — do it together with renewals

1. For each paying shop: open their `/dashboard`, copy the numbers, send the
   ROI WhatsApp line, collect UPI, write down the new renewal date
   (full routine lives in `ONBOARDING.md`, monthly loop).
2. Then one extra tap: Supabase → Backups → confirm a recent backup exists.
   If the page looks empty or broken, tell your next AI session.

## Every 3 months — three chores

1. **Privacy check**: confirm each owner still sees only their own shop
   (ask your AI session to “re-prove owner data separation” — 10 minutes).
2. **Login check**: open Supabase → Authentication → confirm Google is still
   enabled and the redirect URLs are still listed (exact list lives in
   Part 2, §4 — compare line by line).
3. **Password drill**: change ONE secret (bot token, service key, or admin
   key — rotation steps live in Part 2, §2), update it in both places
   (`.env.local` + Vercel), redeploy, test. Next quarter, rotate another one.

## When something breaks — find your symptom

| What you see | Do this, in order |
|---|---|
| No Telegram message arrives | 1. Submit a 2-star test yourself — does it arrive in ~10s? 2. Check the shop’s `telegram_chat_id` is filled (ask AI where). 3. If the token was recently changed somewhere, it must match in BOTH `.env.local` and Vercel + redeploy. |
| Shop page says “Shop not found” | The link has a typo in the shop’s short-name. Copy the exact link from `/admin` — don’t retype it. |
| Gift button does nothing | The freebie link is dead or private. Open it yourself in a browser; fix sharing or replace the link in Shop settings. If a custom gift file is attached, re-upload the PDF in `/admin` → shop → “Gift file”. |
| Owner can’t log in / gets bounced | Run the login checklist in Part 2, §4, top to bottom — it’s a settings mismatch 9 times out of 10. |
| Owner dashboard is empty | The shop isn’t linked to their login yet — assign their email in `/admin` (they must sign in once first). |
| Website shows an error page after a deploy | Vercel → Deployments → click the failed one → missing setting is the usual cause → add it → Redeploy. |

## Gift files — instant downloads

- To attach: open `/admin?key=YOUR_KEY` → shop → “Gift file” → “Upload PDF” → pick a PDF (10MB or less).
- To revert to the link: same panel → “Remove”. Scanners then use the Drive/link again.
- Gift file: a PDF you upload once per shop. Scanners tap once and it saves to their phone (no new tab).

## Posters — custom design

- To attach: open `/admin?key=YOUR_KEY` → shop → “Poster” → “Upload design” → pick a PDF, PNG or JPG (10MB or less).
- To revert to plain: same page → “Remove”. The plain QR poster stays as backup either way.
- Custom poster: your designed version. Owners download it from their `/dashboard/poster` page.

## Money — the one rule

Today the machinery costs ~₹0 (free tiers) plus manual-UPI collection (₹0 fee;
a ~₹6/subscription gateway fee applies only if payments move to a processor). Free tiers have ceilings (Part 2, §6) — you watch them every
Monday (above). The rule: **grow revenue first, upgrade only when a limit
actually bites, never in advance.** Ten paying shops ≈ ₹3,000/month; that’s
when paid tiers even become a conversation.

---

# PART 2 — TECHNICAL APPENDIX (for the AI, not the founder)

*Founder: stop here. Everything below is written for AI sessions doing
maintenance and code work. It must stay exactly true as the product changes
(see the living-doc rule in `AGENTS.md`).*

## 1. Inventory — what exists, where

| Piece | Location / value | Notes |
|---|---|---|
| Web app (production) | `https://star-gate-nine.vercel.app` (Vercel project `star-gate-nine`) | Auto-deploys from GitHub `main` |
| Code | GitHub `apex-digital-craft/StarGate`, branch `main` | — |
| Database | Supabase project ref `dzokcieufpoofpqrjyqv` | Postgres + Auth; SQL in `supabase/` |
| Telegram alerts | One shared bot (username saved by founder) | Token in env, never in git |
| Google login | Google Cloud OAuth client → Supabase Auth provider | Supabase callback URI allowlisted (see §4) |
| QR/poster libs | `qrcode`, `jspdf`, `qrcode.react` (npm) | PDF is generated in the browser |

Routes (all live): `/` `/features` `/pricing` `/demo` `/contact` (marketing) ·
`/login` `/auth/callback` (auth) · `/s/[slug]` (customer funnel, no login) ·
`/dashboard` `/dashboard/inbox` `/dashboard/shop` `/dashboard/analytics`
`/dashboard/poster` (owner, Google login) · `/admin` `/admin/poster/[slug]`
 (founder, `?key=ADMIN_SECRET`) · `/api/feedback` `/api/review-click`
  `/api/admin/merchants` `/api/admin/claim` `/api/admin/freebie-upload`
  `/api/admin/poster-upload` `/api/shop` `/api/shop/poster-touch`.

 Migrations (run in order, Supabase → SQL Editor, all re-runnable):
 `supabase/schema.sql` (tables + anon RLS + `test-cafe` seed) →
 `supabase/02-dashboard.sql` (`owner_id` + owner RLS) →
 `supabase/03-activation.sql` (`poster_downloaded_at`) →
 `supabase/04-freebie-file.sql` (`freebie_file_url` + public-read RLS on Storage `freebies` bucket; bucket itself is created in Dashboard → Storage → New bucket, Public ON) →
 `supabase/05-poster-file.sql` (`poster_image_url` + public-read RLS on Storage `posters` bucket; bucket itself is created in Dashboard → Storage → New bucket, Public ON).

 Data model: `merchants` (all routes resolve from lowercase `slug`; `owner_id`
 nullable → `auth.users`; `telegram_chat_id` server-only; `freebie_file_url`
 nullable → public Storage `freebies` PDF ≤10MB, instant download, `freebie_url`
 stays as link fallback; `poster_image_url` nullable → public Storage `posters`
 PDF/PNG/JPG ≤10MB, custom design, plain QR PDF stays as backup) · `feedbacks`
(`merchant_id` cascade, rating 1–5, index on `(merchant_id, created_at)`) ·
`review_clicks` (`merchant_id` cascade). RLS: anon SELECT `merchants` + INSERT
`feedbacks`/`review_clicks`, deny rest; authenticated owners SELECT/UPDATE own
merchant + SELECT own feedbacks/clicks; service role bypasses (server only).

## 2. Secrets map — the 6 env vars

| Var | Type in Vercel | Lives in | Rotate how |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Config | `.env.local` + Vercel | Rarely; Supabase dashboard → Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Config | `.env.local` + Vercel | Rarely; same place |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | `.env.local` + Vercel | Dashboard → API → regenerate → update both + redeploy |
| `TELEGRAM_BOT_TOKEN` | **Secret** | `.env.local` + Vercel | BotFather → `/revoke` → update both + redeploy |
| `NEXT_PUBLIC_BASE_URL` | Config | `.env.local` + Vercel | Change on domain move + redeploy (baked at build) |
| `ADMIN_SECRET` | **Secret** | `.env.local` + Vercel | Invent new → update both + redeploy; re-bookmark admin links |

Rules: `.env.local` is gitignored — verify with `git check-ignore .env.local`
before every commit. `NEXT_PUBLIC_*` ship in the browser bundle (public by
design); the other three must never gain that prefix. Browser code must use
literal `process.env.NEXT_PUBLIC_*` (dynamic `process.env[name]` does NOT
inline in client bundles). Vercel env change → redeploy to take effect.

## 3. Cadence details (expands Part 1)

- **Weekly logs**: search Runtime Logs for `console.error` lines
  (`telegram alert failed`, `feedback insert failed`, `shop update failed`).
  Isolated lines are normal; clusters mean an outage in progress.
- **Monthly deps**: `npm audit` must be clean; `npm outdated` — upgrade only
  what `npm run build` still passes with. Stack: Next.js 16 (Turbopack) +
  React 19 + Tailwind v4 + `@supabase/ssr` (+ `@supabase/supabase-js`);
  session refresh lives in `proxy.ts` (`middleware.ts` is deprecated in v16).
- **Quarterly RLS re-proof**: temp second user must see only its own shop and
  feedback (procedure in git history, slice 2); delete temp artifacts after.
  Confirm `Content-Range: */0` on test tables when empty. Beware PowerShell
  `@($null).Count -eq 1` and `%`-wildcard double-encoding in `like` filters —
  prefer exact `eq` deletes.

## 4. Auth checklist (exact values)

- Supabase → Authentication → Providers → Google: Enabled, ID + secret saved.
- Supabase → Authentication → URL Configuration → Redirect URLs must contain
  every origin plus `/auth/callback`: `http://localhost:3000/auth/callback`
  (dev) and the production URL + `/auth/callback`.
- Google Cloud → Credentials → OAuth client → Authorized redirect URIs must
  contain `https://dzokcieufpoofpqrjyqv.supabase.co/auth/v1/callback`
  (exact, no trailing slash; Google caches changes ~5 min).
- Failure signatures: `?error=link` (bad/expired link), provider errors
  (provider disabled), `redirect_uri_mismatch` (Google allowlist).

## 5. Runbook internals (expands Part 1 table)

- **Alerts stopped**: `telegram_chat_id` empty/wrong → fix row; token mismatch
  between `.env.local`/Vercel → align + redeploy; failure never blocks saving
  (design rule in `POST /api/feedback`).
- **Database full/slow**: inspect table sizes; `feedbacks` grows forever —
  archive old rows before the free cap (~500MB, confirm in dashboard).
- **Spam wave**: `/api/feedback` is 10/min/IP in-memory per serverless
  instance — not DDoS-proof. Tighten or add Supabase-side throttling if abused.
- **Slug changes**: break printed QRs/posters — admin requires typed confirm;
  never rename casually.

## 6. Cost watch (numbers behind Part 1)

 Free tiers (confirm current caps in each dashboard — they change): Supabase
 ≈500MB database + ~1GB storage (gift PDFs ≤10MB each — dozens of shops fit
 comfortably) + bandwidth allowance; Vercel ≈100GB bandwidth; Telegram Bot
API free unlimited. Manual UPI collection is free; gateway processing would cost ≈₹6/subscription. Upgrade triggers: database
nearing cap (archive first), bandwidth overages, or team seats. Never upgrade
preemptively.

## 7. Keeping this doc alive

Any change to infra, data model, env vars, auth, or vendors must update this
file in the same change (rule also in `AGENTS.md`). Part 1 stays jargon-free:
new concepts get a one-line plain definition on first use; every step starts
with a verb and names the exact button/page. Changed something by hand in a
dashboard? Tell the AI in one line next session and it reconciles here.
