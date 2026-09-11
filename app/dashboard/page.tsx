import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Checklist from "./Checklist";
import QrCard from "./QrCard";
import RoiCopy from "./RoiCopy";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Owner RLS applies: only shops claimed by this login are visible.
  const { data: shops } = await supabase
    .from("merchants")
    .select("id, slug, shop_name, freebie_title, telegram_chat_id, poster_downloaded_at")
    .order("created_at", { ascending: false });
  const shop = shops?.[0] ?? null;

  let clicks7 = 0;
  let clicks30 = 0;
  let feedbacks7 = 0;
  let feedbacks30 = 0;
  let avg: number | null = null;

  if (shop) {
    // Request-scoped timestamps: this Server Component runs once per request,
    // so impure Date.now() is stable here (not reactive render state).
    // eslint-disable-next-line react-hooks/purity
    const since30 = new Date(Date.now() - 30 * DAY).toISOString();
    // eslint-disable-next-line react-hooks/purity
    const since7 = new Date(Date.now() - 7 * DAY).toISOString();
    const [{ data: clicks }, { data: feedbacks }] = await Promise.all([
      supabase
        .from("review_clicks")
        .select("created_at")
        .eq("merchant_id", shop.id)
        .gte("created_at", since30),
      supabase
        .from("feedbacks")
        .select("rating, created_at")
        .eq("merchant_id", shop.id)
        .gte("created_at", since30),
    ]);
    clicks30 = clicks?.length ?? 0;
    clicks7 = (clicks ?? []).filter((c) => c.created_at >= since7).length;
    feedbacks30 = feedbacks?.length ?? 0;
    feedbacks7 = (feedbacks ?? []).filter((f) => f.created_at >= since7).length;
    if (feedbacks30 > 0) {
      const sum = (feedbacks ?? []).reduce((s, f) => s + f.rating, 0);
      avg = sum / feedbacks30;
    }
  }

  let firstScan = false;
  if (shop) {
    const [{ count: totalClicks }, { count: totalFeedbacks }] =
      await Promise.all([
        supabase
          .from("review_clicks")
          .select("id", { count: "exact", head: true })
          .eq("merchant_id", shop.id),
        supabase
          .from("feedbacks")
          .select("id", { count: "exact", head: true })
          .eq("merchant_id", shop.id),
      ]);
    firstScan = (totalClicks ?? 0) + (totalFeedbacks ?? 0) > 0;
  }

  const roiLine = shop
    ? `Your STARGATE this month: ${clicks30} Google-review taps + ${feedbacks30} private feedbacks` +
      (avg !== null ? ` (avg ${avg.toFixed(1)}★)` : "") +
      ` — ${shop.shop_name}`
    : "";
  const funnelUrl = shop
    ? `${(process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "")}/s/${shop.slug}`
    : "";

  return (
    <main className="font-sans">
      <div className="mx-auto w-full max-w-md px-6 py-6">
        <p className="text-sm text-zinc-500">
          Signed in as {user.email ?? "unknown"}
        </p>

        {shop ? (
          <Checklist
            telegramLinked={!!shop.telegram_chat_id}
            posterReady={!!shop.poster_downloaded_at}
            firstScan={firstScan}
          />
        ) : null}

        {shop ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Stat
                label="Review taps"
                value={String(clicks30)}
                sub={`${clicks7} in the last 7 days`}
              />
              <Stat
                label="Private feedbacks"
                value={String(feedbacks30)}
                sub={`${feedbacks7} in the last 7 days`}
              />
              <Stat
                label="Avg rating"
                value={avg !== null ? `${avg.toFixed(1)}★` : "—"}
                sub="last 30 days, private"
              />
              <Stat
                label="Freebie"
                value={shop.freebie_title}
                sub={`Funnel: /s/${shop.slug}`}
              />
            </div>
            <RoiCopy line={roiLine} />
            <QrCard url={funnelUrl} />
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-center">
            <p className="font-semibold text-zinc-900">No shop linked yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Ask the founder to link your shop to {user.email ?? "your login"}{" "}
              — then your numbers appear here.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
