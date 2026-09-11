import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// Owner edits their own shop. Runs as the logged-in user, so owner RLS
// applies. slug + telegram_chat_id are founder-only and never accepted here,
// even if a caller sends them.
export async function PUT(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const {
    shop_name,
    google_review_url,
    freebie_url,
    freebie_title,
    brand_color,
    logo_url,
  } = (body ?? {}) as Record<string, unknown>;

  if (typeof shop_name !== "string" || !shop_name.trim()) {
    return NextResponse.json(
      { error: "shop_name is required." },
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
    brand_color !== null &&
    (typeof brand_color !== "string" ||
      !/^#[0-9a-fA-F]{6}$/.test(brand_color))
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
    (typeof logo_url !== "string" || !isHttpUrl(logo_url))
  ) {
    return NextResponse.json(
      { error: "logo_url must be a valid http(s) URL." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: owned } = await supabase
    .from("merchants")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!owned) {
    return NextResponse.json({ error: "No shop linked." }, { status: 404 });
  }

  const { error } = await supabase
    .from("merchants")
    .update({
      shop_name: shop_name.trim(),
      google_review_url,
      freebie_url,
      freebie_title: freebie_title.trim(),
      brand_color: brand_color || null,
      logo_url: logo_url || null,
    })
    .eq("id", owned.id);
  if (error) {
    console.error("shop update failed:", error);
    return NextResponse.json(
      { error: "Couldn't save. Try again." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
