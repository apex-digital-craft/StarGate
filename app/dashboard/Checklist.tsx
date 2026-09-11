import Link from "next/link";

function Step({
  done,
  title,
  body,
  action,
}: {
  done: boolean;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          done ? "bg-green-600 text-white" : "border-2 border-zinc-300 text-transparent"
        }`}
      >
        ✓
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${done ? "text-zinc-400 line-through" : "text-zinc-900"}`}>
          {title}
        </p>
        {!done ? <p className="mt-0.5 text-sm text-zinc-600">{body}</p> : null}
        {!done && action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}

// Activation checklist: guides a new owner from login to first live scan.
// Renders nothing once everything is done except a slim confirmation.
export default function Checklist({
  telegramLinked,
  posterReady,
  firstScan,
}: {
  telegramLinked: boolean;
  posterReady: boolean;
  firstScan: boolean;
}) {
  const allDone = telegramLinked && posterReady && firstScan;
  if (allDone) {
    return (
      <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
        <p className="text-sm font-semibold text-green-800">
          You&apos;re live — scans, alerts, and gifts all working.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Get set up"
      className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4"
    >
      <p className="font-semibold text-zinc-900">Get set up</p>
      <div className="mt-3 flex flex-col gap-4">
        <Step done title="Shop linked" body="" />
        <Step
          done={telegramLinked}
          title="Telegram alerts live"
          body={
            telegramLinked
              ? ""
              : "Ask the founder to link your Telegram — unhappy ratings reach you instantly once connected."
          }
        />
        <Step
          done={posterReady}
          title="Poster downloaded"
          body={posterReady ? "" : "Print it, stick it at the counter."}
          action={
            posterReady ? undefined : (
              <Link
                href="/dashboard/poster"
                className="inline-flex h-10 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Get your poster
              </Link>
            )
          }
        />
        <Step
          done={firstScan}
          title="First customer scan"
          body={
            firstScan
              ? ""
              : "Appears here automatically once someone rates via your QR."
          }
        />
      </div>
    </section>
  );
}
