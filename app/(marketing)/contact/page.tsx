import Link from "next/link";
import { WHATSAPP_URL } from "../whatsapp";

export default function ContactPage() {
  return (
    <main className="bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-zinc-900">Contact</h1>
        <p className="mx-auto mt-3 max-w-md text-zinc-600">
          One channel, answered by a human. Tell us your shop name and city —
          we&apos;ll take it from there.
        </p>

        <div className="mx-auto mt-6 max-w-md rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-lg font-semibold text-zinc-900">WhatsApp</p>
          <p className="mt-1 text-sm text-zinc-600">
            Fastest way to start, pay, or get help.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-[#1FA855] text-base font-semibold text-white"
          >
            Chat now
          </a>
        </div>

        <div className="mx-auto mt-4 max-w-md rounded-2xl border border-zinc-200 bg-white p-6">
          <p className="text-lg font-semibold text-zinc-900">
            Already an owner?
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Jump straight into your dashboard.
          </p>
          <Link
            href="/login"
            className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white"
          >
            Owner login
          </Link>
        </div>
      </div>
    </main>
  );
}
