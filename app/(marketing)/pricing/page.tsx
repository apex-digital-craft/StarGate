import { WHATSAPP_URL } from "../whatsapp";

const FAQ = [
  {
    q: "What's included?",
    a: "Your QR funnel page, instant Telegram alerts, printable A4 QR poster, and an owner dashboard with review stats, inbox, and 30-day numbers.",
  },
  {
    q: "How does onboarding work?",
    a: "Message us on WhatsApp with your shop name, Google review link, and freebie. We set up your page and poster — usually the same day.",
  },
  {
    q: "How do I pay?",
    a: "UPI, collected over WhatsApp — ₹299 every month or ₹2,999 once a year. No app install, no cards.",
  },
];

export default function PricingPage() {
  return (
    <main className="bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-xl px-6 py-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900">Pricing</h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            One plan. Less than one family dinner a month.
          </p>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-brand-700 p-5 text-center text-white">
            <p className="text-2xl font-bold">₹299</p>
            <p className="mt-1 text-sm text-brand-100">per month</p>
            <p className="mt-2 text-xs text-brand-200">pay monthly over UPI</p>
          </div>
          <div className="rounded-2xl border-2 border-zinc-900 bg-white p-5 text-center">
            <p className="text-2xl font-bold text-zinc-900">₹2,999</p>
            <p className="mt-1 text-sm text-zinc-500">per year</p>
            <p className="mt-2 text-xs font-semibold text-zinc-700">
              2 months free
            </p>
          </div>
        </div>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-[#1FA855] text-base font-semibold text-white"
        >
          Start on WhatsApp
        </a>

        <section className="mt-10">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            Questions
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <p className="font-semibold text-zinc-900">{f.q}</p>
                <p className="mt-1 text-sm text-zinc-600">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
