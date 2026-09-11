import Link from "next/link";

const WHATSAPP_URL =
  "https://wa.me/919821323725?text=Hi!%20I%20want%20STARGATE%20for%20my%20shop.";

const STEPS = [
  {
    n: "1",
    title: "Customer scans your QR",
    body: "A poster on your counter offers a gift for a 30-second rating.",
  },
  {
    n: "2",
    title: "They tap 1–5 stars",
    body: "A fast mobile page — no app, no login, no typing needed to start.",
  },
  {
    n: "3",
    title: "Reviews go public, complaints go private",
    body: "4–5 stars open your Google review page. 1–3 stars message you privately instead — and alert you instantly.",
  },
];

const BENEFITS = [
  {
    title: "Instant alerts",
    body: "Every unhappy rating lands on your Telegram in seconds, with stars, words, and time.",
  },
  {
    title: "Print-ready QR poster",
    body: "A high-contrast A4 poster with your shop name — print it, stick it, done.",
  },
  {
    title: "Monthly numbers",
    body: "See review clicks plus private feedbacks, so you know exactly what STARGATE earned you.",
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-xl px-6 py-12">
        {/* Hero */}
        <section className="text-center">
          <p className="text-sm font-semibold tracking-widest text-zinc-500">
            STARGATE
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">
            Turn happy customers into Google reviews
          </h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600">
            STARGATE routes your 4–5 star customers to Google and your 1–3
            star customers to you — privately. Everyone gets a gift, so
            everyone taps.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-14 w-full items-center justify-center rounded-full bg-[#1FA855] text-base font-semibold text-white"
            >
              Chat on WhatsApp — ₹299/month
            </a>
            <Link
              href="/s/test-cafe"
              className="flex h-14 w-full items-center justify-center rounded-full border border-zinc-300 bg-white text-base font-semibold text-zinc-900"
            >
              Try the live demo
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-12">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            How it works
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-base font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-zinc-900">{s.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Owner benefits */}
        <section className="mt-12">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            What you get
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <p className="font-semibold text-zinc-900">{b.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="mt-12">
          <h2 className="text-center text-xl font-semibold text-zinc-900">
            One simple price
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-900 p-5 text-center text-white">
              <p className="text-2xl font-bold">₹299</p>
              <p className="mt-1 text-sm text-zinc-300">per month</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
              <p className="text-2xl font-bold text-zinc-900">₹2,999</p>
              <p className="mt-1 text-sm text-zinc-500">
                per year — 2 months free
              </p>
            </div>
          </div>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-[#1FA855] text-base font-semibold text-white"
          >
            Get STARGATE on WhatsApp
          </a>
        </section>

        <footer className="mt-12 text-center text-sm text-zinc-500">
          <p>
            Run a shop?{" "}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-800"
            >
              Message us
            </a>{" "}
            ·{" "}
            <Link href="/s/test-cafe" className="font-semibold text-zinc-800">
              Live demo
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
