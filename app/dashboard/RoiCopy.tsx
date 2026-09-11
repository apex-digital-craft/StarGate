"use client";

import { useState } from "react";

export default function RoiCopy({ line }: { line: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions) — owner can long-press the text.
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
      <p className="text-sm text-zinc-700">{line}</p>
      <button
        type="button"
        onClick={onCopy}
        className="mt-3 h-11 w-full rounded-full bg-brand-600 hover:bg-brand-700 text-sm font-semibold text-white"
      >
        {copied ? "Copied!" : "Copy for WhatsApp"}
      </button>
    </div>
  );
}
