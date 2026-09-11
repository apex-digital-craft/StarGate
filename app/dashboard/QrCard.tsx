"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

// What the customer sees: scannable QR + link + preview of the funnel page.
export default function QrCard({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — owner can long-press the URL text.
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-center">
      <p className="font-semibold text-zinc-900">Your customer page</p>
      <p className="mt-1 text-sm text-zinc-500">
        Exactly what customers see when they scan your QR.
      </p>
      <div className="mx-auto mt-4 w-fit rounded-xl border border-zinc-200 p-3">
        <QRCodeSVG value={url} size={180} aria-label="Customer page QR code" />
      </div>
      <p className="mt-3 break-all text-xs text-zinc-500">{url}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="h-11 flex-1 rounded-full border border-zinc-300 bg-white text-sm font-semibold text-zinc-800"
        >
          {copied ? "Copied!" : "Copy URL"}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Open preview
        </a>
      </div>
    </div>
  );
}
