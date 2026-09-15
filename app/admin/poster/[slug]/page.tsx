import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getMerchantBySlug } from "@/lib/supabase";
import PosterDownloader from "./PosterDownloader";
import PosterCustomUploader from "./PosterCustomUploader";

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

// Founder production bench, two steps:
// 1. Grab the QR (PNG for pasting into the design, or the plain A4 PDF).
// 2. Upload the finished custom poster for merchants to download.
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
          <p className="mt-1 break-all text-sm text-zinc-500">{pageUrl}</p>

          {/* STEP 1 — QR source for the custom design */}
          <section className="mt-5 border-t border-zinc-100 pt-5">
            <p className="text-left text-sm font-semibold text-zinc-900">
              Step 1 — Get the QR for your design
            </p>
            {/* Server-rendered preview of exactly what goes on the plain poster */}
            <img
              src={qrDataUrl}
              alt={`QR code for ${merchant.shop_name}`}
              className="mx-auto mt-3 h-48 w-48"
            />
            <a
              href={qrDataUrl}
              download={`qr-${merchant.slug}.png`}
              className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-brand-600 hover:bg-brand-700 text-base font-semibold text-white"
            >
              Download QR PNG
            </a>
            <p className="mt-2 text-xs text-zinc-500">
              Clean QR image — paste it straight into your Canva/Photoshop
              design. (Same-origin data URL, so it always saves.)
            </p>
            <PosterDownloader
              slug={merchant.slug}
              shopName={merchant.shop_name}
              pageUrl={pageUrl}
              qrDataUrl={qrDataUrl}
              label="Plain poster PDF (A4)"
              secondary
            />
          </section>

          {/* STEP 2 — finished custom design */}
          <section className="mt-5 border-t border-zinc-100 pt-5">
            <p className="text-left text-sm font-semibold text-zinc-900">
              Step 2 — Finished design for merchants
            </p>
            {merchant.poster_image_url ? (
              <img
                src={merchant.poster_image_url}
                alt={`Custom poster for ${merchant.shop_name}`}
                className="mx-auto mt-3 max-h-96 w-auto rounded-xl border border-zinc-200"
              />
            ) : null}
            <PosterCustomUploader
              slug={merchant.slug}
              adminKey={key}
              initialUrl={merchant.poster_image_url}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
