"use client";

import { useState } from "react";

export type InboxItem = {
  id: string;
  rating: number;
  feedback_text: string | null;
  created_at: string;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "1", label: "1★" },
  { key: "2", label: "2★" },
  { key: "3", label: "3★" },
] as const;

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(iso));
}

export default function InboxList({ items }: { items: InboxItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const shown =
    filter === "all" ? items : items.filter((i) => i.rating === Number(filter));

  return (
    <div>
      <div className="mt-4 flex gap-2" role="group" aria-label="Filter by stars">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={`h-10 flex-1 rounded-full text-sm font-semibold ${
              filter === f.key
                ? "bg-brand-600 text-white"
                : "border border-zinc-300 bg-white text-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-center">
          <p className="font-semibold text-zinc-900">No feedback here yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            {items.length === 0
              ? "Private 1–3 star notes from your QR funnel will land here."
              : "Nothing with this rating. Try another filter."}
          </p>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {shown.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-lg font-bold text-amber-500"
                  aria-label={`Rated ${item.rating} out of 5`}
                >
                  {"★".repeat(item.rating)}
                  <span className="text-zinc-300">
                    {"★".repeat(5 - item.rating)}
                  </span>
                </span>
                <span className="text-xs text-zinc-500">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <p className="mt-2 text-zinc-800">
                {item.feedback_text?.trim() || (
                  <span className="italic text-zinc-400">
                    No written feedback — stars only.
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
