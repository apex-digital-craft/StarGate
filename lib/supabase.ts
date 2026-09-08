import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type Merchant = {
  id: string;
  slug: string;
  shop_name: string;
  google_review_url: string;
  freebie_url: string;
  freebie_title: string;
  brand_color: string | null;
  logo_url: string | null;
};

let cached: SupabaseClient | null = null;

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing env var ${name} — copy .env.example to .env.local and fill it in.`
    );
  }
  return value;
}

// Anon-key client. RLS allows: SELECT merchants, INSERT feedbacks/review_clicks. Nothing else.
export function getSupabase(): SupabaseClient {
  if (!cached) {
    cached = createClient(
      getEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
  }
  return cached;
}

export async function getMerchantBySlug(slug: string): Promise<Merchant | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("merchants")
    .select(
      "id, slug, shop_name, google_review_url, freebie_url, freebie_title, brand_color, logo_url"
    )
    .eq("slug", slug.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Merchant | null;
}
