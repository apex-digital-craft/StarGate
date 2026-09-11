import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InboxList from "./InboxList";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
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

  const { data: feedbacks } = shop
    ? await supabase
        .from("feedbacks")
        .select("id, rating, feedback_text, created_at")
        .eq("merchant_id", shop.id)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

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
          {shop ? `Inbox — ${shop.shop_name}` : "Inbox"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Private 1–3 star notes. Anonymous by design — read-only.
        </p>
        {shop ? (
          <InboxList items={feedbacks ?? []} />
        ) : (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-center">
            <p className="font-semibold text-zinc-900">No shop linked yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Ask the founder to link your shop — then feedback appears here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
