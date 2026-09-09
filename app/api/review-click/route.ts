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

// Fire-and-forget ROI log for the high-rating path. The client reveals the
// freebie regardless of this response (no review verification in V1).
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { slug } = (body ?? {}) as { slug?: unknown };
  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }

  try {
    const service = getServiceClient();
    const { data: merchant, error: lookupError } = await service
      .from("merchants")
      .select("id")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!merchant) {
      return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
    }
    const { error: insertError } = await service
      .from("review_clicks")
      .insert({ merchant_id: merchant.id });
    if (insertError) throw insertError;
  } catch (err) {
    console.error("review-click failed:", err);
    return NextResponse.json({ error: "Couldn't log click." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
