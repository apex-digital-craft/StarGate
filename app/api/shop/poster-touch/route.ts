import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Marks the owner's poster as downloaded (activation checklist step).
// Runs as the logged-in user, so owner RLS applies.
export async function POST() {
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

  // Route handler runs once per request — Date.now() is stable here.
  const now = new Date(Date.now()).toISOString();
  const { error } = await supabase
    .from("merchants")
    .update({ poster_downloaded_at: now })
    .eq("id", owned.id);
  if (error) {
    console.error("poster-touch failed:", error);
    return NextResponse.json({ error: "Couldn't save." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
