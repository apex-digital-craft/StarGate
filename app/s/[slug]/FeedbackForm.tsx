"use client";

import { useState, type FormEvent } from "react";
import type { Merchant } from "@/lib/supabase";
import FreebieUnlock from "./FreebieUnlock";

type Status = "idle" | "sending" | "done" | "error";

export default function FeedbackForm({
  merchant,
  rating,
}: {
  merchant: Merchant;
  rating: number;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  if (status === "done") {
    return (
      <FreebieUnlock
        title={merchant.freebie_title}
        url={merchant.freebie_url}
        accent={merchant.brand_color}
      />
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: merchant.slug, rating, text }),
      });
      if (!res.ok) throw new Error(`feedback failed: ${res.status}`);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 w-full">
      <label
        htmlFor="stargate-feedback"
        className="block text-sm font-medium text-zinc-800"
      >
        Tell the owner privately — they read every note.
      </label>
      <textarea
        id="stargate-feedback"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="What could be better? (optional)"
        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
      />
      {status === "error" ? (
        <p role="alert" className="mt-2 text-sm text-red-600">
          Couldn&apos;t send. Check your connection and try again.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        style={merchant.brand_color ? { backgroundColor: merchant.brand_color } : undefined}
        className="mt-3 h-14 w-full rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send & claim gift"}
      </button>
      {/* Policy safety: nobody is blocked from Google — the option visibly exists
          on the unhappy path. Plain link: no gift change, no click logging. */}
      <p className="mt-3 text-center text-sm">
        <a
          href={merchant.google_review_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 underline decoration-zinc-300 underline-offset-2"
        >
          Prefer to review on Google directly?
        </a>
      </p>
    </form>
  );
}
