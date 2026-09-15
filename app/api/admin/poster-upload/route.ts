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

const BUCKET = "posters";
const MAX_BYTES = 10 * 1024 * 1024; // 10MB cap, same as gift files.

type Kind = { ext: string; contentType: string };

function detectKind(bytes: Uint8Array): Kind | null {
  // PDF: %PDF-
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return { ext: "pdf", contentType: "application/pdf" };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }
  // JPEG: FF D8 FF
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  return null;
}

// Founder-only custom poster upload. Multipart form: key, slug, file.
// Accepts PDF, PNG, JPG (magic-byte validated). Writes via service role.
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
      { error: "Poster must be non-empty and 10MB or less." },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = detectKind(bytes);
  if (!kind) {
    return NextResponse.json(
      { error: "Only PDF, PNG or JPG posters are accepted." },
      { status: 400 }
    );
  }

  try {
    const service = getServiceClient();
    const { data: merchant, error: merchantError } = await service
      .from("merchants")
      .select("id, poster_image_url")
      .eq("slug", slug)
      .maybeSingle();
    if (merchantError) throw merchantError;
    if (!merchant) {
      return NextResponse.json({ error: "Shop not found." }, { status: 404 });
    }

    const path = `${slug}/${Date.now()}.${kind.ext}`;
    const { error: uploadError } = await service.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: kind.contentType,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    const { data: publicData } = service.storage.from(BUCKET).getPublicUrl(path);
    const posterUrl = publicData.publicUrl;

    const { error: updateError } = await service
      .from("merchants")
      .update({ poster_image_url: posterUrl })
      .eq("id", merchant.id);
    if (updateError) throw updateError;

    // Best-effort cleanup of the previous design. Never blocks success.
    try {
      const old = (merchant as { poster_image_url?: string | null })
        .poster_image_url;
      if (old && old.includes(`/${BUCKET}/`)) {
        const oldPath = old.split(`/${BUCKET}/`)[1]?.split("?")[0];
        if (oldPath) {
          await service.storage.from(BUCKET).remove([oldPath]);
        }
      }
    } catch {
      // Ignore cleanup failures.
    }

    return NextResponse.json({ ok: true, poster_image_url: posterUrl });
  } catch (err) {
    console.error("poster upload failed:", err);
    return NextResponse.json(
      { error: "Couldn't upload. Check the posters bucket exists and try again." },
      { status: 500 }
    );
  }
}

// Founder-only removal: revert to the plain auto-generated QR PDF.
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
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (merchantError) throw merchantError;
    if (!merchant) {
      return NextResponse.json({ error: "Shop not found." }, { status: 404 });
    }
    const { error: updateError } = await service
      .from("merchants")
      .update({ poster_image_url: null })
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
    console.error("poster remove failed:", err);
    return NextResponse.json(
      { error: "Couldn't remove. Try again." },
      { status: 500 }
    );
  }
}
