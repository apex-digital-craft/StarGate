import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  // Demo mode (?demo=1): visitors tap freely — nothing is written to the
  // database and no Telegram alert fires.
  const demoUrl = baseUrl ? `${baseUrl}/s/test-cafe?demo=1` : "/s/test-cafe?demo=1";

  return (
    <main className="bg-zinc-50 font-sans">
      <div className="mx-auto grid w-full max-w-4xl items-center gap-10 px-6 py-12 sm:grid-cols-2">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-zinc-900">Live demo</h1>
          <p className="mx-auto mt-3 max-w-md text-zinc-600 sm:mx-0">
            Point your phone camera at the QR — it opens a real shop funnel.
            Tap 4–5 stars to see the Google path, 1–3 for the private path.
            Demo mode: nothing is saved or sent.
          </p>
          <Link
            href="/s/test-cafe?demo=1"
            className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 text-base font-semibold text-white hover:bg-brand-700"
          >
            Open the demo funnel
          </Link>
          <p className="mt-3 text-sm text-zinc-500">
            On desktop? Click above instead of scanning.
          </p>
        </div>

        <div className="mx-auto w-fit rounded-2xl border border-zinc-200 bg-white p-6 text-center">
          {baseUrl ? (
            <QRCodeSVG value={demoUrl} size={220} aria-label="Demo funnel QR code" />
          ) : (
            <p className="text-sm text-red-600">
              Demo QR unavailable — site URL is not configured.
            </p>
          )}
          <p className="mt-3 break-all text-xs text-zinc-500">{demoUrl}</p>
        </div>
      </div>
    </main>
  );
}
