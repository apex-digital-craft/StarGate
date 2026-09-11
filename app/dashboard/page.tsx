import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";
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
    .select("id, slug, shop_name, freebie_title")
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

  const roiLine = shop
    ? `Your STARGATE this month: ${clicks30} Google-review taps + ${feedbacks30} private feedbacks` +
      (avg !== null ? ` (avg ${avg.toFixed(1)}★)` : "") +
      ` — ${shop.shop_name}`
    : "";

  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto w-full max-w-md px-6 py-10">
        <p className="text-sm font-semibold tracking-widest text-zinc-500">
          STARGATE
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
          {shop ? shop.shop_name : "Owner dashboard"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Signed in as {user.email ?? "unknown"}
        </p>

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

        <div className="w-full">
          <Link
            href="/dashboard/inbox"
            className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-zinc-900 text-base font-semibold text-white"
          >
            View review inbox
          </Link>
          <Link
            href="/dashboard/shop"
            className="mt-3 flex h-14 w-full items-center justify-center rounded-full border border-zinc-300 bg-white text-base font-semibold text-zinc-800"
          >
            Shop settings
          </Link>
          <Link
            href="/dashboard/analytics"
            className="mt-3 flex h-14 w-full items-center justify-center rounded-full border border-zinc-300 bg-white text-base font-semibold text-zinc-800"
          >
            30-day trends
          </Link>
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
