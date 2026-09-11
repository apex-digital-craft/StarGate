import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;
const DAYS = 30;

type Week = {
  label: string;
  taps: number;
  feedbacks: number;
  avg: number | null;
};

function dayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

function shortLabel(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(d);
}

function avgText(avg: number | null): string {
  return avg !== null ? `${avg.toFixed(1)}★` : "—";
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Owner RLS applies: only shops claimed by this login are visible.
  const { data: shops } = await supabase
    .from("merchants")
    .select("id, shop_name")
    .order("created_at", { ascending: false });
  const shop = shops?.[0] ?? null;

  let totalTaps = 0;
  let totalFeedbacks = 0;
  let totalAvg: number | null = null;
  const weeks: Week[] = [];

  if (shop) {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const since = new Date(now - (DAYS - 1) * DAY).toISOString().slice(0, 10);
    const [{ data: clicks }, { data: feedbacks }] = await Promise.all([
      supabase
        .from("review_clicks")
        .select("created_at")
        .eq("merchant_id", shop.id)
        .gte("created_at", since),
      supabase
        .from("feedbacks")
        .select("rating, created_at")
        .eq("merchant_id", shop.id)
        .gte("created_at", since),
    ]);

    const tapsByDay = new Map<string, number>();
    for (const c of clicks ?? []) {
      const k = dayKey(new Date(c.created_at));
      tapsByDay.set(k, (tapsByDay.get(k) ?? 0) + 1);
    }
    const fbByDay = new Map<string, { n: number; sum: number }>();
    for (const f of feedbacks ?? []) {
      const k = dayKey(new Date(f.created_at));
      const s = fbByDay.get(k) ?? { n: 0, sum: 0 };
      s.n += 1;
      s.sum += f.rating;
      fbByDay.set(k, s);
    }

    totalTaps = clicks?.length ?? 0;
    totalFeedbacks = feedbacks?.length ?? 0;
    if (totalFeedbacks > 0) {
      totalAvg =
        (feedbacks ?? []).reduce((s, f) => s + f.rating, 0) / totalFeedbacks;
    }

    // Four week blocks: 0–6, 7–13, 14–20, 21–29 days ago.
    const spans: Array<[number, number]> = [
      [0, 6],
      [7, 13],
      [14, 20],
      [21, 29],
    ];
    for (const [fromAgo, toAgo] of spans) {
      let taps = 0;
      let n = 0;
      let sum = 0;
      for (let ago = fromAgo; ago <= toAgo; ago++) {
        const k = dayKey(new Date(now - ago * DAY));
        taps += tapsByDay.get(k) ?? 0;
        const s = fbByDay.get(k);
        if (s) {
          n += s.n;
          sum += s.sum;
        }
      }
      const start = new Date(now - toAgo * DAY);
      const end = new Date(now - fromAgo * DAY);
      weeks.push({
        label: `${shortLabel(start)} – ${shortLabel(end)}`,
        taps,
        feedbacks: n,
        avg: n > 0 ? sum / n : null,
      });
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-md px-6 py-10">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-zinc-600"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          {shop ? `Numbers — ${shop.shop_name}` : "Numbers"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Last 30 days, India time.</p>

        {shop ? (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">{totalTaps}</p>
                <p className="mt-1 text-xs text-zinc-500">review taps</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">
                  {totalFeedbacks}
                </p>
                <p className="mt-1 text-xs text-zinc-500">feedbacks</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">
                  {avgText(totalAvg)}
                </p>
                <p className="mt-1 text-xs text-zinc-500">avg rating</p>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500">
                    <th scope="col" className="px-4 py-3 font-medium">
                      Week
                    </th>
                    <th scope="col" className="px-2 py-3 text-right font-medium">
                      Taps
                    </th>
                    <th scope="col" className="px-2 py-3 text-right font-medium">
                      Fdbk
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Avg
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((w) => (
                    <tr key={w.label} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3 text-zinc-800">{w.label}</td>
                      <td className="px-2 py-3 text-right font-semibold text-zinc-900">
                        {w.taps}
                      </td>
                      <td className="px-2 py-3 text-right font-semibold text-zinc-900">
                        {w.feedbacks}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-700">
                        {avgText(w.avg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-center">
            <p className="font-semibold text-zinc-900">No shop linked yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Ask the founder to link your shop — then numbers appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
