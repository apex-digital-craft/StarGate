import Link from "next/link";
import { WHATSAPP_URL } from "./whatsapp";

const PAINS = [
  {
    title: "An angry customer reviews in 30 seconds",
    body: "It takes one bad evening for a 1★ to sit on your Google profile — where every future customer reads it first.",
  },
  {
    title: "You hear about it weeks later, if ever",
    body: "No one tells the owner to their face. By the time you notice the rating drop, the damage is done.",
  },
  {
    title: "Every public complaint drags your Map Pack rank",
    body: "Google rewards businesses with fresh, happy reviews. Silent unhappy customers give you nothing — loudly unhappy ones cost you footfall.",
  },
];

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
    title: "Happy goes public, unhappy goes private",
    body: "4–5 stars open your Google review page. 1–3 stars message you privately instead — and alert you instantly.",
  },
];

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-brand-50 via-zinc-50 to-zinc-50 font-sans">
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-12 pt-10 sm:pt-14">
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold tracking-widest text-brand-700">
              FOR CAFES, SALONS, CLINICS & GYMS
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-zinc-900 sm:text-5xl">
              Bad reviews are stealing your footfall.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-zinc-600 sm:mx-0">
              STARGATE catches unhappy customers{" "}
              <em className="not-italic font-semibold text-zinc-900">
                before
              </em>{" "}
              they reach Google — and turns happy ones into 5★ reviews with a
              gift.
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
              <a
                href="#how"
                className="flex h-14 w-full items-center justify-center rounded-full border border-zinc-300 bg-white text-base font-semibold text-zinc-900"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Before / after */}
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                Without Stargate
              </p>
              <p className="mt-2 font-semibold text-zinc-900">
                An angry 1★ sits on Google for months.
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                You hear nothing. Future customers read it first.
              </p>
            </div>
            <div className="mt-3 rounded-3xl border-2 border-brand-600 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700">
                With Stargate
              </p>
              <p className="mt-2 font-semibold text-zinc-900">
                The complaint lands on your Telegram in seconds.
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                The happy customer leaves a 5★ — with a gift.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain */}
      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-12">
          <h2 className="text-center text-2xl font-bold text-zinc-900">
            The review gap is costing you daily
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PAINS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-red-100 bg-red-50 p-5"
              >
                <p className="font-semibold text-zinc-900">{p.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-12">
        <h2 className="text-center text-2xl font-bold text-zinc-900">
          Fixed in 30 seconds per customer
        </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s) => (
            <div
              key={s.n}
              className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">
                {s.n}
              </span>
              <div>
                <p className="font-semibold text-zinc-900">{s.title}</p>
                <p className="mt-1 text-sm text-zinc-600">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Two paths */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-900 p-5 text-white">
            <p className="text-3xl text-amber-400" aria-hidden="true">
              ★★★★★
            </p>
            <p className="mt-2 font-semibold">4–5 stars → Google</p>
            <p className="mt-1 text-sm text-zinc-300">
              Straight to your review page. Gift unlocks on tap.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-brand-600 bg-white p-5">
            <p className="text-3xl" aria-hidden="true">
              <span className="text-amber-400">★★</span>
              <span className="text-zinc-300">★★★</span>
            </p>
            <p className="mt-2 font-semibold text-zinc-900">
              1–3 stars → you, privately
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              Telegram alert in seconds. Gift still unlocks.
            </p>
          </div>
        </div>

        <Link
          href="/demo"
          className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 text-base font-semibold text-white hover:bg-brand-700"
        >
          Open the full demo
        </Link>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-5xl px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-zinc-900">
            Less than one family dinner a month
          </h2>
          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3">
            <div className="rounded-2xl bg-brand-700 p-5 text-white">
              <p className="text-2xl font-bold">₹299</p>
              <p className="mt-1 text-sm text-brand-100">per month</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-2xl font-bold text-zinc-900">₹2,999</p>
              <p className="mt-1 text-sm text-zinc-500">per year, 2 months free</p>
            </div>
          </div>
          <p className="mt-4">
            <Link href="/pricing" className="text-sm font-semibold text-zinc-800">
              Full pricing details →
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-700">
        <div className="mx-auto w-full max-w-5xl px-6 py-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready when your next customer walks in.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-brand-100">
            Message us your shop name today — your QR is live the same day.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-6 flex h-14 w-full max-w-md items-center justify-center rounded-full bg-white text-base font-semibold text-zinc-900"
          >
            Get STARGATE on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
