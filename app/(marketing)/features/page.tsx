import Link from "next/link";
import { WHATSAPP_URL } from "../whatsapp";

const FEATURES = [
  {
    title: "Review funnel",
    body: "One QR scan opens a mobile page: tap 1–5 stars, no app or login. 4–5 stars are routed to your Google review page; 1–3 stars get a private feedback box instead. Everyone unlocks a gift, so everyone taps.",
    cta: { href: "/demo", label: "Try the live demo" },
  },
  {
    title: "Instant Telegram alerts",
    body: "Every unhappy rating lands on your Telegram in seconds — stars, the customer's words, and the time. Catch problems while the customer is still in your shop.",
    cta: null,
  },
  {
    title: "Printable QR poster",
    body: "A high-contrast A4 poster with your shop name and QR, generated per shop. Print it, laminate it, stick it on the counter — readable from 2–3 feet.",
    cta: { href: "/demo", label: "See a sample poster" },
  },
  {
    title: "Owner dashboard",
    body: "Sign in with Google to see review taps, private feedback counts, and average rating. Read every private note in your review inbox, edit your shop details anytime, and track 30-day numbers.",
    cta: { href: "/login", label: "Owner login" },
  },
];

export default function FeaturesPage() {
  return (
    <main className="bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900">Features</h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            Everything a local shop needs to turn footfall into Google
            reviews — and catch complaints before they go public.
          </p>
        </section>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <section
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <h2 className="text-lg font-semibold text-zinc-900">
                {f.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {f.body}
              </p>
              {f.cta ? (
                <p className="mt-3">
                  <Link
                    href={f.cta.href}
                    className="text-sm font-semibold text-zinc-900"
                  >
                    {f.cta.label} →
                  </Link>
                </p>
              ) : null}
            </section>
          ))}
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-6 flex h-14 w-full max-w-md items-center justify-center rounded-full bg-[#1FA855] text-base font-semibold text-white"
        >
          Get STARGATE on WhatsApp
        </a>
      </div>
    </main>
  );
}
