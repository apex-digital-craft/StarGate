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

const BUCKET = "freebies";
const MAX_BYTES = 10 * 1024 * 1024; // 10MB founder-picked cap for PDF ebooks.

// Founder-only freebie PDF upload. Multipart form: key, slug, file.
// Writes via service role (anon/authenticated have no storage write grant).
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload body." }, { status: 400 });
  }
  const key = form.get("key");
  const slugRaw = form.get("slug");
  const file = form.get("file");

  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const slug = typeof slugRaw === "string" ? slugRaw.toLowerCase().trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "PDF must be non-empty and 10MB or less." },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Validate PDF magic bytes — extension/MIME alone is spoofable.
  if (
    bytes.length < 5 ||
    bytes[0] !== 0x25 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x44 ||
    bytes[3] !== 0x46 ||
    bytes[4] !== 0x2d
  ) {
    return NextResponse.json(
      { error: "Only PDF files are accepted." },
      { status: 400 }
    );
  }

  try {
    const service = getServiceClient();
    const { data: merchant, error: merchantError } = await service
      .from("merchants")
      .select("id, freebie_file_url")
      .eq("slug", slug)
      .maybeSingle();
    if (merchantError) throw merchantError;
    if (!merchant) {
      return NextResponse.json({ error: "Shop not found." }, { status: 404 });
    }

    const path = `${slug}/${Date.now()}.pdf`;
    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: publicData } = service.storage
      .from(BUCKET)
      .getPublicUrl(path);
    const fileUrl = publicData.publicUrl;

    const { error: updateError } = await service
      .from("merchants")
      .update({ freebie_file_url: fileUrl })
      .eq("id", merchant.id);
    if (updateError) throw updateError;

    // Best-effort cleanup of the previous file so storage doesn't grow forever.
    // Never blocks the successful upload.
    try {
      const old = (merchant as { freebie_file_url?: string | null })
        .freebie_file_url;
      if (old && old.includes(`/${BUCKET}/`)) {
        const oldPath = old.split(`/${BUCKET}/`)[1]?.split("?")[0];
        if (oldPath) {
          await service.storage.from(BUCKET).remove([oldPath]);
        }
      }
    } catch {
      // Ignore cleanup failures.
    }

    return NextResponse.json({ ok: true, freebie_file_url: fileUrl });
  } catch (err) {
    console.error("freebie upload failed:", err);
    return NextResponse.json(
      { error: "Couldn't upload. Check the freebies bucket exists and try again." },
      { status: 500 }
    );
  }
}

// Founder-only removal: revert to the legacy Drive/link freebie.
export async function DELETE(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { key, slug: slugRaw } = (body ?? {}) as Record<string, unknown>;
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const slug = typeof slugRaw === "string" ? slugRaw.toLowerCase().trim() : "";
  if (!slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }
  try {
    const service = getServiceClient();
    const { data: merchant, error: merchantError } = await service
      .from("merchants")
      .select("id, freebie_file_url")
      .eq("slug", slug)
      .maybeSingle();
    if (merchantError) throw merchantError;
    if (!merchant) {
      return NextResponse.json({ error: "Shop not found." }, { status: 404 });
    }
    const { error: updateError } = await service
      .from("merchants")
      .update({ freebie_file_url: null })
      .eq("id", merchant.id);
    if (updateError) throw updateError;
    try {
      const { data: listed } = await service.storage.from(BUCKET).list(slug);
      const paths = (listed ?? []).map((f) => `${slug}/${f.name}`);
      if (paths.length > 0) {
        await service.storage.from(BUCKET).remove(paths);
      }
    } catch {
      // Ignore cleanup failures.
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("freebie remove failed:", err);
    return NextResponse.json(
      { error: "Couldn't remove. Try again." },
      { status: 500 }
    );
  }
}
