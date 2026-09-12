import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { slugify } from "../route";

let serviceClient: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase server env vars are not set.");
  }
  if (!serviceClient) {
    serviceClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function unauthorized(body: unknown): boolean {
  const key = (body as Record<string, unknown> | null)?.key;
  return !process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET;
}

type Ctx = { params: Promise<{ slug: string }> };

// Founder-only edit. Slug changes break printed QRs/posters, so a rename
// requires confirmSlug to exactly match the new slug.
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (unauthorized(body)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const {
    shop_name,
    google_review_url,
    freebie_url,
    freebie_title,
    telegram_chat_id,
    brand_color,
    logo_url,
    new_slug,
    confirmSlug,
  } = (body ?? {}) as Record<string, unknown>;

  if (typeof shop_name !== "string" || !shop_name.trim()) {
    return NextResponse.json({ error: "shop_name is required." }, { status: 400 });
  }
  if (typeof google_review_url !== "string" || !isHttpUrl(google_review_url.trim())) {
    return NextResponse.json(
      { error: "google_review_url must be a valid http(s) URL." },
      { status: 400 }
    );
  }
  if (typeof freebie_url !== "string" || !isHttpUrl(freebie_url.trim())) {
    return NextResponse.json(
      { error: "freebie_url must be a valid http(s) URL." },
      { status: 400 }
    );
  }
  if (typeof freebie_title !== "string" || !freebie_title.trim()) {
    return NextResponse.json({ error: "freebie_title is required." }, { status: 400 });
  }
  if (
    brand_color !== undefined &&
    brand_color !== "" &&
    brand_color !== null &&
    (typeof brand_color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(brand_color.trim()))
  ) {
    return NextResponse.json(
      { error: "brand_color must look like #RRGGBB." },
      { status: 400 }
    );
  }
  if (
    logo_url !== undefined &&
    logo_url !== "" &&
    logo_url !== null &&
    (typeof logo_url !== "string" || !isHttpUrl(logo_url.trim()))
  ) {
    return NextResponse.json(
      { error: "logo_url must be a valid http(s) URL." },
      { status: 400 }
    );
  }

  let finalSlug = slug.toLowerCase();
  if (typeof new_slug === "string" && new_slug.trim()) {
    const cleaned = slugify(new_slug);
    if (!cleaned) {
      return NextResponse.json({ error: "That slug is not usable." }, { status: 400 });
    }
    if (cleaned !== finalSlug && confirmSlug !== cleaned) {
      return NextResponse.json(
        { error: "Slug change needs typed confirmation." },
        { status: 400 }
      );
    }
    finalSlug = cleaned;
  }

  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from("merchants")
      .update({
        slug: finalSlug,
        shop_name: shop_name.trim(),
        google_review_url: google_review_url.trim(),
        freebie_url: freebie_url.trim(),
        freebie_title: freebie_title.trim(),
        telegram_chat_id:
          typeof telegram_chat_id === "string" ? telegram_chat_id.trim() : "",
        brand_color:
          typeof brand_color === "string" && brand_color.trim()
            ? brand_color.trim()
            : null,
        logo_url:
          typeof logo_url === "string" && logo_url.trim()
            ? logo_url.trim()
            : null,
      })
      .eq("slug", slug.toLowerCase())
      .select("id, slug, shop_name")
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, merchant: data });
  } catch (err) {
    console.error("admin merchant update failed:", err);
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json({ error: "That slug is taken." }, { status: 409 });
    }
    return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  }
}

// Founder-only delete. Permanent: the shop plus its feedbacks and clicks go
// (DB cascades). Requires { confirm } to exactly match the slug.
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const clean = slug.toLowerCase();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (unauthorized(body)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { confirm } = (body ?? {}) as { confirm?: unknown };
  if (confirm !== clean) {
    return NextResponse.json(
      { error: "Type the slug to confirm deletion." },
      { status: 400 }
    );
  }

  try {
    const service = getServiceClient();
    const { data: merchant, error: lookupError } = await service
      .from("merchants")
      .select("id")
      .eq("slug", clean)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!merchant) {
      return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
    }
    const [{ count: feedbacks }, { count: clicks }] = await Promise.all([
      service.from("feedbacks").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
      service.from("review_clicks").select("id", { count: "exact", head: true }).eq("merchant_id", merchant.id),
    ]);
    const { error: deleteError } = await service
      .from("merchants")
      .delete()
      .eq("id", merchant.id);
    if (deleteError) throw deleteError;
    return NextResponse.json({
      ok: true,
      deleted: { feedbacks: feedbacks ?? 0, clicks: clicks ?? 0 },
    });
  } catch (err) {
    console.error("admin merchant delete failed:", err);
    return NextResponse.json({ error: "Couldn't delete. Try again." }, { status: 500 });
  }
}
