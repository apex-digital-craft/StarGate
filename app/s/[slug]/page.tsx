import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMerchantBySlug } from "@/lib/supabase";
import RatingFlow from "./RatingFlow";

// Fresh merchant data on every scan — never a stale cached page.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const merchant = await getMerchantBySlug(slug);
  return {
    title: merchant ? `${merchant.shop_name} — Rate your visit` : "Shop not found",
  };
}

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;
  const merchant = await getMerchantBySlug(slug);
  if (!merchant) notFound();

  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10">
        <RatingFlow merchant={merchant} />
      </div>
    </main>
  );
}
