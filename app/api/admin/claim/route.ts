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
    serviceClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return serviceClient;
}

// Founder-only: link (or unlink) a shop to an owner login by email.
// The owner must have signed in at least once — that creates their auth user.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { key, slug, owner_email } = (body ?? {}) as {
    key?: unknown;
    slug?: unknown;
    owner_email?: unknown;
  };

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }

  try {
    const service = getServiceClient();
    const { data: merchant, error: lookupError } = await service
      .from("merchants")
      .select("id, slug")
      .eq("slug", slug.toLowerCase())
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!merchant) {
      return NextResponse.json({ error: "Unknown shop." }, { status: 404 });
    }

    const email =
      typeof owner_email === "string" ? owner_email.trim().toLowerCase() : "";
    if (!email) {
      // Unassign.
      const { error } = await service
        .from("merchants")
        .update({ owner_id: null })
        .eq("id", merchant.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, slug: merchant.slug, owner: null });
    }

    // Pilot scale: scan the user list for the email. (Grows into an indexed
    // lookup if owners ever number in the hundreds.)
    let ownerId: string | null = null;
    let page = 1;
    for (;;) {
      const { data, error } = await service.auth.admin.listUsers({
        page,
        perPage: 100,
      });
      if (error) throw error;
      const match = data.users.find(
        (u) => (u.email ?? "").toLowerCase() === email
      );
      if (match) {
        ownerId = match.id;
        break;
      }
      if (data.users.length < 100) break;
      page += 1;
      if (page > 20) break;
    }
    if (!ownerId) {
      return NextResponse.json(
        { error: "No login with that email yet — ask them to sign in first." },
        { status: 404 }
      );
    }

    const { error: updateError } = await service
      .from("merchants")
      .update({ owner_id: ownerId })
      .eq("id", merchant.id);
    if (updateError) throw updateError;
    return NextResponse.json({ ok: true, slug: merchant.slug, owner: email });
  } catch (err) {
    console.error("admin claim failed:", err);
    return NextResponse.json(
      { error: "Couldn't assign owner. Try again." },
      { status: 500 }
    );
  }
}
