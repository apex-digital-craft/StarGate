import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-sm font-semibold tracking-widest text-zinc-500">
          STARGATE
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-zinc-900">
          Turn happy customers into Google reviews
        </h1>
        <p className="mt-3 text-zinc-600">
          Scan a shop&apos;s QR, rate your visit in seconds, and claim a gift.
          Happy ratings become public reviews — unhappy ones reach the owner
          privately.
        </p>
        <Link
          href="/s/test-cafe"
          className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white"
        >
          Try the live demo
        </Link>
        <p className="mt-4 text-sm text-zinc-500">
          A shop owner? Ask us for your own QR poster.
        </p>
      </div>
    </main>
  );
}
