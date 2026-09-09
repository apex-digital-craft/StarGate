import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getMerchantBySlug } from "@/lib/supabase";
import PosterDownloader from "./PosterDownloader";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ key?: string }>;
};

function Unauthorized() {
  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Unauthorized</h1>
        <p className="mt-2 text-zinc-600">
          This admin page needs a valid <code>?key=...</code> link.
        </p>
      </div>
    </main>
  );
}

export default async function PosterPage({ params, searchParams }: Props) {
  const [{ slug }, { key }] = await Promise.all([params, searchParams]);
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return <Unauthorized />;
  }

  const merchant = await getMerchantBySlug(slug);
  if (!merchant) notFound();

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const pageUrl = `${baseUrl}/s/${merchant.slug}`;
  const qrDataUrl = await QRCode.toDataURL(pageUrl, {
    width: 800,
    margin: 2,
  });

  return (
    <main className="min-h-dvh bg-zinc-200 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 py-10">
        <div className="w-full rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="text-2xl font-bold text-zinc-900">
            {merchant.shop_name}
          </h1>
          {/* Server-rendered preview of exactly what goes on the poster */}
          <img
            src={qrDataUrl}
            alt={`QR code for ${merchant.shop_name}`}
            className="mx-auto mt-4 h-64 w-64"
          />
          <p className="mt-4 text-xl font-semibold text-zinc-900">
            Scan &amp; Get FREE Gift
          </p>
          <p className="mt-1 break-all text-sm text-zinc-500">{pageUrl}</p>
          <PosterDownloader
            slug={merchant.slug}
            shopName={merchant.shop_name}
            pageUrl={pageUrl}
            qrDataUrl={qrDataUrl}
          />
        </div>
      </div>
    </main>
  );
}
