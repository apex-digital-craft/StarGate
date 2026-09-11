import Link from "next/link";
import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OwnerPosterDownloader from "./OwnerPosterDownloader";

export const dynamic = "force-dynamic";

export default async function OwnerPosterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Owner RLS applies: only shops claimed by this login are visible.
  const { data: shops } = await supabase
    .from("merchants")
    .select("slug, shop_name")
    .order("created_at", { ascending: false });
  const shop = shops?.[0] ?? null;

  if (!shop) {
    return (
      <main className="min-h-dvh bg-zinc-50 font-sans">
        <div className="mx-auto w-full max-w-md px-6 py-10 text-center">
          <p className="font-semibold text-zinc-900">No shop linked yet</p>
          <p className="mt-1 text-sm text-zinc-600">
            Ask the founder to link your shop first.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-semibold text-zinc-800"
          >
            ← Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const pageUrl = `${baseUrl}/s/${shop.slug}`;
  const qrDataUrl = await QRCode.toDataURL(pageUrl, {
    width: 800,
    margin: 2,
  });

  return (
    <main className="min-h-dvh bg-zinc-200 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 py-10">
        <div className="w-full rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="text-2xl font-bold text-zinc-900">{shop.shop_name}</h1>
          <img
            src={qrDataUrl}
            alt={`QR code for ${shop.shop_name}`}
            className="mx-auto mt-4 h-64 w-64"
          />
          <p className="mt-4 text-xl font-semibold text-zinc-900">
            Scan &amp; Get FREE Gift
          </p>
          <p className="mt-1 break-all text-sm text-zinc-500">{pageUrl}</p>
          <OwnerPosterDownloader
            slug={shop.slug}
            shopName={shop.shop_name}
            pageUrl={pageUrl}
            qrDataUrl={qrDataUrl}
          />
          <p className="mt-3 text-xs text-zinc-400">
            Print it, stick it at the counter — readable from 2–3 feet.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="mt-4 text-sm font-semibold text-zinc-600"
        >
          ← Dashboard
        </Link>
      </div>
    </main>
  );
}
