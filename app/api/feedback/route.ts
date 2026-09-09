import { NextResponse, type NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Rate limit: 10 requests/min per IP, in-memory.
// Note: counted per serverless instance — fine for V1 pilot scale, not a DDoS defense.
const WINDOW_MS = 60_000;
const MAX_HITS = 10;
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

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

// Plain text, no parse_mode → no markup-injection risk. Truncated to fit Telegram's 4096-char cap.
async function sendTelegramAlert(args: {
  chatId: string;
  shopName: string;
  rating: number;
  text: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set.");
  if (!args.chatId) throw new Error("Merchant has no telegram_chat_id yet.");
  const message = `⭐ ${args.rating}/5 — ${args.shopName}\n${args.text.slice(0, 1000).trim()}\n${new Date().toISOString()}`;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: args.chatId, text: message }),
  });
  if (!res.ok) throw new Error(`Telegram sendMessage failed: ${res.status}`);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { slug, rating, text } = (body ?? {}) as {
    slug?: unknown;
    rating?: unknown;
    text?: unknown;
  };

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "rating must be an integer from 1 to 5." },
      { status: 400 }
    );
  }
  const feedbackText = typeof text === "string" ? text.slice(0, 2000) : "";

  if (isRateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  // Server-side lookup via service role: fetches telegram_chat_id, which is
  // never sent to the browser (the public Merchant type excludes it).
  let merchant: {
    id: string;
    slug: string;
    shop_name: string;
    telegram_chat_id: string;
  } | null;
  try {
    const { data, error } = await getServiceClient()
      .from("merchants")
      .select("id, slug, shop_name, telegram_chat_id")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    merchant = data;
  } catch (err) {
    console.error("feedback merchant lookup failed:", err);
    return NextResponse.json(
      { error: "Couldn't save feedback. Try again." },
      { status: 500 }
    );
  }
  if (!merchant) {
    return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
  }

  try {
    const { error } = await getServiceClient()
      .from("feedbacks")
      .insert({
        merchant_id: merchant.id,
        rating,
        feedback_text: feedbackText || null,
      });
    if (error) throw error;
  } catch (err) {
    console.error("feedback insert failed:", err);
    return NextResponse.json(
      { error: "Couldn't save feedback. Try again." },
      { status: 500 }
    );
  }

  // Telegram must never block the save or the freebie unlock.
  try {
    await sendTelegramAlert({
      chatId: merchant.telegram_chat_id,
      shopName: merchant.shop_name,
      rating,
      text: feedbackText,
    });
  } catch (err) {
    console.error("telegram alert failed (feedback still saved):", err);
  }

  return NextResponse.json({ ok: true });
}
