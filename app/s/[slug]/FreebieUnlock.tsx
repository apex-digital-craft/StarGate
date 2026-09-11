"use client";

export default function FreebieUnlock({
  title,
  url,
  accent,
}: {
  title: string;
  url: string;
  accent?: string | null;
}) {
  return (
    <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-2xl font-bold text-white">
        ✓
      </span>
      <p className="mt-3 text-lg font-semibold text-zinc-900">Your gift is unlocked!</p>
      <p className="mt-1 text-zinc-700">{title}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={accent ? { backgroundColor: accent } : undefined}
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white"
      >
        Claim your gift
      </a>
    </div>
  );
}
