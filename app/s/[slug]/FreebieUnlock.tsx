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
      <p className="text-lg font-semibold text-zinc-900">Your gift is unlocked!</p>
      <p className="mt-1 text-zinc-700">{title}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={accent ? { backgroundColor: accent } : undefined}
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white"
      >
        Claim your gift
      </a>
    </div>
  );
}
