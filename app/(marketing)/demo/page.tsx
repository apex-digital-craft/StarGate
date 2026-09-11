import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const demoUrl = baseUrl ? `${baseUrl}/s/test-cafe` : "/s/test-cafe";

  return (
    <main className="bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-xl px-6 py-12 text-center">
        <h1 className="text-3xl font-bold text-zinc-900">Live demo</h1>
        <p className="mx-auto mt-3 max-w-md text-zinc-600">
          Point your phone camera at the QR — it opens a real shop funnel.
          Tap 4–5 stars to see the Google path, 1–3 for the private path.
        </p>

        <div className="mx-auto mt-6 w-fit rounded-2xl border border-zinc-200 bg-white p-6">
          {baseUrl ? (
            <QRCodeSVG value={demoUrl} size={220} aria-label="Demo funnel QR code" />
          ) : (
            <p className="text-sm text-red-600">
              Demo QR unavailable — site URL is not configured.
            </p>
          )}
          <p className="mt-3 break-all text-xs text-zinc-500">{demoUrl}</p>
        </div>

        <Link
          href="/s/test-cafe"
          className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white"
        >
          Open the demo funnel
        </Link>
        <p className="mt-3 text-sm text-zinc-500">
          On desktop? Click above instead of scanning.
        </p>
      </div>
    </main>
  );
}
