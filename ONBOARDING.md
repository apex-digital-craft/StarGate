# STARGATE — Shop Onboarding Checklist

One checklist per shop. Copy this section per merchant. Base URL used below:
`https://star-gate-nine.vercel.app` (swap if a custom domain is added).

Admin key lives in `.env.local` as `ADMIN_SECRET` (never commit, never share publicly).

## Per-shop onboarding

- [ ] **1. Collect details** (in person or WhatsApp)
  - Exact shop name
  - Google review link (Maps → business → Share → copy; must be an `https://` URL)
  - Freebie URL (Drive/menu/coupon link) + freebie title (e.g. “Free Chai”)
  - Owner's login email (they must sign in with Google at `/login` at least once)
  - Owner's Telegram account (they must send `hi` to the bot at least once)

- [ ] **2. Create the shop** — `/admin?key=ADMIN_SECRET` → New shop form → Create
  - Verify: funnel loads at `/s/{slug}` with the shop name

- [ ] **3. Link the owner login** — in `/admin`, on the shop card: paste owner email → Assign
  - Verify: card shows `Owner: <email>`
  - Owner verifies: sign in → `/dashboard` shows their shop + zeros

- [ ] **4. Link Telegram alerts** — founder runs `GET https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates`, copies the owner's `chat.id`
  - Paste it into `telegram_chat_id` (ask me — currently set via database until owner-edit covers it)
  - Verify: submit a 2-star test on the funnel → alert arrives in ~10s → delete the test row

- [ ] **5. Deliver the poster** — `/admin/poster/{slug}?key=ADMIN_SECRET` (or owner: `/dashboard/poster`) → Download A4 PDF → WhatsApp it to the owner
  - Owner prints/laminates (~₹20) and sticks it at the counter

- [ ] **6. Live in-shop test** (under 1 minute)
  - Scan wall QR → 2 stars → complaint → submit → Telegram buzzes → gift appears
  - Scan again → 5 stars → Google opens → gift appears immediately

- [ ] **7. Collect payment** via UPI — [Pay ₹299/month](https://upi.pe/9821323725@ptyes/299.00?pn=Apex+Digital+Craft&tn=one+month+StarGate+subscription) or [Pay ₹2,999/year](https://upi.pe/9821323725@ptyes/2999.00?pn=Apex+Digital+Craft&tn=one+year+subscription+%28two+months+free%29) → note renewal date (same date next month, or +1 year for yearly)

## Monthly loop (per paying shop)

- [ ] Pull numbers: `/dashboard` (or Supabase counts) → WhatsApp the ROI line
- [ ] Collect renewal via UPI → update renewal date
- [ ] If freebie/Google link rotted, update via `/dashboard/shop` (owner) or `/admin` (founder)

## Troubleshooting

| Symptom | Fix |
|---|---|
| No Telegram alert | `chat.id` missing/wrong → redo step 4; bot token rotated? update `.env.local` + Vercel + redeploy |
| QR won't scan | Reprint larger / higher contrast; test scan from 2–3 ft |
| Funnel says “Shop not found” | Slug typo — copy the exact `/s/{slug}` from `/admin` |
| Owner dashboard empty | Shop not claimed → redo step 3 (owner must sign in first) |
| Owner login loops to `?error=link` | Link expired (>1h for magic path) or redirect URL missing in Supabase Auth settings; Google provider needs the Supabase callback URI allowlisted |
| Gift button dead | Freebie URL invalid → update in settings; must be `http(s)` |
