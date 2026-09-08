# STARGATE

Review-gating micro-SaaS for local SMBs (₹299/mo): QR scan → rate 1–5 → private feedback or Google review + freebie.

Source of truth: `STARGATE-MVP-PLAN.md`. Agent instructions: `AGENTS.md`.

## Dev

```sh
npm run dev    # local dev
npm run build  # production build check
npm run lint   # eslint
```

Stack: Next.js 16 App Router + TypeScript + Tailwind v4 on Vercel, Supabase Postgres, Telegram Bot API. Env vars: see `AGENTS.md`.
