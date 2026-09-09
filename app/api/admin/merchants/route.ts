import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase server env vars are not set.");
  }
  if (!serviceClient) {
    serviceClient = createClient(url, key);
  }
  return serviceClient;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Founder-only merchant creation. No auth in V1 beyond ADMIN_SECRET.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const {
    key,
    shop_name,
    slug,
    google_review_url,
    freebie_url,
    freebie_title,
    telegram_chat_id,
    brand_color,
  } = (body ?? {}) as Record<string, unknown>;

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (typeof shop_name !== "string" || !shop_name.trim()) {
    return NextResponse.json(
      { error: "shop_name is required." },
      { status: 400 }
    );
  }
  const finalSlug = slugify(typeof slug === "string" && slug ? slug : shop_name);
  if (!finalSlug) {
    return NextResponse.json(
      { error: "Could not make a slug from that name." },
      { status: 400 }
    );
  }
  if (typeof google_review_url !== "string" || !isHttpUrl(google_review_url)) {
    return NextResponse.json(
      { error: "google_review_url must be a valid http(s) URL." },
      { status: 400 }
    );
  }
  if (typeof freebie_url !== "string" || !isHttpUrl(freebie_url)) {
    return NextResponse.json(
      { error: "freebie_url must be a valid http(s) URL." },
      { status: 400 }
    );
  }
  if (typeof freebie_title !== "string" || !freebie_title.trim()) {
    return NextResponse.json(
      { error: "freebie_title is required." },
      { status: 400 }
    );
  }
  if (
    brand_color !== undefined &&
    brand_color !== "" &&
    (typeof brand_color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(brand_color))
  ) {
    return NextResponse.json(
      { error: "brand_color must look like #RRGGBB." },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await getServiceClient()
      .from("merchants")
      .insert({
        slug: finalSlug,
        shop_name: shop_name.trim(),
        google_review_url,
        freebie_url,
        freebie_title: freebie_title.trim(),
        telegram_chat_id:
          typeof telegram_chat_id === "string" ? telegram_chat_id.trim() : "",
        brand_color: brand_color || null,
      })
      .select("id, slug, shop_name")
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, merchant: data });
  } catch (err) {
    console.error("admin merchant create failed:", err);
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json(
        { error: "That slug is taken. Try another name." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Couldn't create merchant. Try again." },
      { status: 500 }
    );
  }
}
