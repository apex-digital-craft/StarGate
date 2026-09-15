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

// Same-origin download proxy. Browsers ignore the `download` attribute on
// cross-origin (Supabase Storage) URLs and open the file in a tab instead —
// proxying through the app origin with `Content-Disposition: attachment`
// forces a real Save dialog on desktop and a direct download on Android.
// (iOS Safari still opens inline; Apple offers no alternative.)
//
// GET /api/download/freebie/[slug] → gift-{slug}.pdf (application/pdf)
// GET /api/download/poster/[slug]  → poster-{slug}.{ext} (pdf/png/jpg)
// Public (files are already public); unknown slug/kind → 404.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ kind: string; slug: string }> }
) {
  const { kind, slug: slugRaw } = await params;
  if (kind !== "freebie" && kind !== "poster") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const slug = (slugRaw ?? "").toLowerCase().trim();
  if (!slug) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const service = getServiceClient();
    const column = kind === "freebie" ? "freebie_file_url" : "poster_image_url";
    const bucket = kind === "freebie" ? "freebies" : "posters";
    const { data: merchant, error: merchantError } = await service
      .from("merchants")
      .select(`id, ${column}`)
      .eq("slug", slug)
      .maybeSingle();
    if (merchantError) throw merchantError;
    const fileUrl = (merchant as Record<string, string | null> | null)?.[
      column
    ];
    if (!merchant || !fileUrl) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    // We only ever serve files we uploaded: {slug}/{timestamp}.{ext}.
    const marker = `/object/public/${bucket}/`;
    const rawPath = fileUrl.split(marker)[1]?.split("?")[0] ?? "";
    if (!rawPath.startsWith(`${slug}/`)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const { data: blob, error: downloadError } = await service.storage
      .from(bucket)
      .download(rawPath);
    if (downloadError || !blob) throw downloadError ?? new Error("empty file");

    const ext = rawPath.split(".").pop()?.toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : "application/pdf";
    const filename =
      kind === "freebie" ? `gift-${slug}.pdf` : `poster-${slug}.${ext ?? "pdf"}`;

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    console.error("download proxy failed:", err);
    return NextResponse.json(
      { error: "Couldn't fetch that file. Try again." },
      { status: 500 }
    );
  }
}
