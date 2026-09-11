import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ShopForm from "./ShopForm";

export const dynamic = "force-dynamic";

export default async function ShopSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Owner RLS applies: only shops claimed by this login are visible.
  const { data: shops } = await supabase
    .from("merchants")
    .select(
      "slug, shop_name, google_review_url, freebie_url, freebie_title, brand_color, logo_url"
    )
    .order("created_at", { ascending: false });
  const shop = shops?.[0] ?? null;

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
          Shop settings
        </h1>
        {shop ? (
          <>
            <p className="mt-1 text-sm text-zinc-500">
              Funnel link /s/{shop.slug} never changes. Telegram linking stays
              with the founder.
            </p>
            <ShopForm
              initial={{
                shop_name: shop.shop_name,
                google_review_url: shop.google_review_url,
                freebie_url: shop.freebie_url,
                freebie_title: shop.freebie_title,
                brand_color: shop.brand_color ?? "",
                logo_url: shop.logo_url ?? "",
              }}
            />
          </>
        ) : (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 text-center">
            <p className="font-semibold text-zinc-900">No shop linked yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Ask the founder to link your shop — then settings appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
