"use client";

export default function FreebieUnlock({
  title,
  url,
  fileUrl,
  accent,
}: {
  title: string;
  url: string;
  fileUrl?: string | null;
  accent?: string | null;
}) {
  // Uploaded PDF takes precedence: same-origin public bucket URL, so the
  // `download` attribute fires an instant download. Legacy Drive/link stays
  // as the fallback (new tab). iOS Safari ignores `download` and opens inline.
  if (fileUrl) {
    return (
      <div className="mt-6 w-full rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-2xl font-bold text-white">
          ✓
        </span>
        <p className="mt-3 text-lg font-semibold text-zinc-900">Your gift is unlocked!</p>
        <p className="mt-1 text-zinc-700">{title}</p>
        <a
          href={fileUrl}
          download
          style={accent ? { backgroundColor: accent } : undefined}
          className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white"
        >
          Download your gift
        </a>
        <p className="mt-2 text-xs text-zinc-500">
          Tap once — the file saves straight to your phone.
        </p>
      </div>
    );
  }

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
