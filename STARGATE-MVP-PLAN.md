# STARGATE MVP — Master Build Plan

Source of truth for V1. Derived from `business-model.md`.

---

## 1. Goal

**Product:** STARGATE (Review Gating & Reputation Micro-SaaS)
**Target:** Independent local SMBs in India (cafes, salons, dental clinics, gyms) dependent on Google Map Pack for footfall.
**Pricing:** ₹299 / month, ₹2,999 / year option, ₹499 one-time setup add-on.

**Problem:** Local businesses struggle to collect positive Google reviews while preventing negative feedback from publicly damaging ratings.

**Solution — 5-step automated 2-way gating engine:**
1. **Scan QR:** Customer scans counter poster to claim digital perk.
2. **Rate Experience:** Lightweight mobile page prompts 1-5 star rating.
3. **Low Rating (1-3):** Anonymous feedback form. Submit alerts owner instantly via Telegram bot + unlocks freebie.
4. **High Rating (4-5):** CTA to leave public Google Review. Click opens official Google Review page + immediately unlocks freebie link.
5. **Printable QR Poster PDF:** Custom-branded high-quality PDF for reception/walls.

**Channels:** Direct walk-ins with 30-sec live demo + WhatsApp for onboarding/renewals.
**Relationships:** High-touch face-to-face onboarding + hands-off automated routing, Telegram alerts, monthly ROI reports.
**Stack:** Next.js on Vercel + Supabase + Telegram Bot API + Google (review destination). UPI via Razorpay/PhonePe/Paytm.
**Cost:** Near-zero — domain ~₹800-1k/yr, Vercel/Supabase free tier, Telegram free unlimited, manual UPI collection (₹0 fee; ~₹6/sub only via gateway), ~₹20 demo poster.

---

## 2. Core Components

Deconstructed goal into individually solvable parts:

### C1. Merchant Tenant Model
One record per shop: `slug, shop_name, google_review_url, freebie_url, freebie_title, telegram_chat_id, brand_color/logo (optional)`. Source of truth for pages + QR + alerts. All routes resolve from `slug`.

### C2. Public Rating Funnel — `/s/[slug]`
Mobile-first, no login. Shows branding → 1-5 star tap. Branches 1-3 to C3, 4-5 to C4. Invalid slug = 404.

### C3. Low-Rating Path (1-3 stars)
Anonymous feedback form (textarea + submit). On submit: save to `feedbacks` → trigger Telegram alert → unlock freebie immediately.

### C4. High-Rating Path (4-5 stars)
Big CTA "Leave Google Review" → opens `google_review_url` in new tab. Freebie unlocks immediately on click (no verification). Log `review_clicks` event for ROI.

### C5. Freebie Delivery
V1 simplest: URL per merchant (Drive link, menu PDF, coupon page). No uploads. Store + render link/button.

### C6. Telegram Alert Service
One shared bot + `TELEGRAM_BOT_TOKEN`. API route on feedback insert calls `POST api.telegram.org/bot<TOKEN>/sendMessage` with shop, stars, text, time.

### C7. QR Poster PDF Generator
Input slug → A4 printable PDF with branding + QR to `/s/[slug]` + "Scan & Get FREE Gift" copy. Founder downloads + WhatsApps to owner.

### C8. Founder Ops / Onboarding
Manual creation of merchant row + Telegram linking + PDF generation for first 5-10 shops. Monthly ROI = manual Supabase count → WhatsApp: "You got X clicks + Y private feedbacks".

### C9. Infra
Next.js on Vercel + Supabase Postgres + Telegram Bot API. No auth in V1 except simple `ADMIN_SECRET` for /admin.

Build order: Data + Funnel → Telegram + Freebie → QR PDF + Onboarding.

---

## 3. Detailed Construction Plan (Start to Finish)

### PHASE 0 — Accounts & Decisions (30 mins)
1. Create GitHub repo, Vercel account, Supabase project, Telegram account.
2. Create bot via BotFather → get `TELEGRAM_BOT_TOKEN` + `t.me/<bot_name>`.
3. Lock: domain for QR URLs (`yourdomain.com/s/[slug]`), Next.js + TypeScript + Tailwind.
4. Slug format: lowercase unique, e.g. `cafe-aroma-kochi`.

### PHASE 1 — Project Foundation
5. Scaffold: `npx create-next-app@latest stargate --typescript --tailwind --app`
6. Install: `@supabase/supabase-js`, `qrcode`, `jspdf`, `qrcode.react`.
7. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_BASE_URL`, `ADMIN_SECRET`.
8. Connect Vercel to GitHub, add env, deploy empty app to verify pipeline.

### PHASE 2 — Database (Supabase)
9. `merchants`: `id uuid, slug text unique, shop_name text, google_review_url text, freebie_url text, freebie_title text, telegram_chat_id text, brand_color text nullable, logo_url text nullable, created_at`.
10. `feedbacks`: `id uuid, merchant_id fk, rating int 1-5, feedback_text text nullable, created_at`.
11. `review_clicks`: `id uuid, merchant_id fk, created_at`.
12. RLS: public SELECT merchants by slug, public INSERT feedbacks/review_clicks, deny rest. Service-role only on server for linking.
13. Seed 1 test merchant `slug=test-cafe`.

### PHASE 3 — Public Funnel `/s/[slug]`
14. `app/s/[slug]/page.tsx`: fetch merchant by slug, 404 if missing. Mobile-first UI, <2s load.
15. Star select → 1-3 show FeedbackForm, 4-5 show GoogleReviewCTA. Allow switching.

### PHASE 4 — Low-Rating Path
16. UI textarea (optional) + Submit.
17. `POST /api/feedback {slug, rating, text}` → insert feedbacks → server-side Telegram send: `⭐2 | Test Cafe + text + time`.
18. Success → freebie unlock screen with button to `freebie_url`.
19. Failure rule: if Telegram fails, still save + still unlock, log error.

### PHASE 5 — High-Rating Path
20. UI "Love us? Leave Google Review to claim gift" + button.
21. Click: `POST /api/review-click {slug}` fire-and-forget → `window.open(google_review_url)` → reveal freebie.

### PHASE 6 — Telegram Linking (MVP-simple)
22. V1 manual: merchant sends "hi" to bot → founder runs `GET api.telegram.org/bot<TOKEN>/getUpdates` → copy `chat.id` → paste into `telegram_chat_id`.
23. V2 later: `t.me/bot?start=slug` + webhook auto-save. Skip for now.

### PHASE 7 — QR Poster PDF
24. `app/admin/poster/[slug]/page.tsx` behind ADMIN_SECRET: preview + Download.
25. Content: shop name, QR encoding `${BASE_URL}/s/${slug}`, "Scan & Get FREE Gift", print-safe high-contrast A4.
26. Generate QR dataURL with `qrcode` → embed in `jspdf` → `poster-{slug}.pdf`.

### PHASE 8 — Minimal Admin `/admin`
27. Password gate `?key=ADMIN_SECRET`. Form: shop_name, slug auto-slugify, google_review_url, freebie_url/title, telegram_chat_id. Create → insert → link to poster.
28. List: merchants + counts + poster link + copy QR URL.

### PHASE 9 — QA & Hardening
29. Rate-limit `/api/feedback` (10/min/IP in-memory), validate rating 1-5, slug exists, sanitize text for Telegram.
30. Lighthouse mobile check, cheap Android Chrome test.

### PHASE 10 — Deploy + Pilot Ops
31. Vercel prod + custom domain, test `domain.com/s/test-cafe` end-to-end with real Telegram.
32. Pilot kit: laminated demo poster (~₹20), phone demo slug, UPI QR for ₹299, WhatsApp templates (onboarding + monthly ROI).
33. Onboard 5-10 shops: create slug → get chat_id → generate PDF → WhatsApp PDF + URL → stick poster → live in-shop scan test.

Open decisions: domain vs vercel.app for pilots, freebie URL-only (yes for V1), manual chat_id paste (yes for V1).

---

## 4. Manual Tests (Simple Language)

Do these on your phone, one by one:

1. **Open shop page** — Open test link `yourdomain.com/s/test-cafe`. Shop name + 5 stars show? Fast and clean on mobile?
2. **Try wrong link** — Open `/s/wrong-shop`. Says "shop not found" nicely, no crash?
3. **Give bad rating** — Tap 2 stars. See feedback box? Type "slow service", submit. Get gift button? Owner Telegram arrives in 10 sec?
4. **Bad rating empty box** — Tap 1 star, leave empty, submit. Still works + gives gift?
5. **Give good rating** — Back, tap 5 stars. See "Leave Google Review"? Tap it. Opens Google? Gift immediately?
6. **Test gift link** — Tap gift button. Opens correct freebie?
7. **Test QR poster** — Download PDF from admin. Scan QR with camera. Opens right shop page? Readable from 2-3 feet?
8. **Test new shop** — In `/admin`, add new shop with name, Google link, gift link, Telegram. Open its link. Works?
9. **Real rehearsal** — As customer: scan wall QR → 2 stars → complaint → submit. As owner: Telegram buzz? Customer gets gift? Under 1 minute?

Pass = all 9 green. If 3, 5, or 9 fail, stop and fix before pilot.
