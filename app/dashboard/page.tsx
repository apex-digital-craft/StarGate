import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export const dynamic = "force-dynamic";

// Slice 1: gate + identity only. Stats, inbox, and settings land in later slices.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="min-h-dvh bg-zinc-50 font-sans">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-sm font-semibold tracking-widest text-zinc-500">
          STARGATE
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-zinc-900">
          Owner dashboard
        </h1>
        <p className="mt-2 text-zinc-600">
          Signed in as {user.email ?? "unknown"}. Stats, inbox, and shop
          settings are coming in the next slices.
        </p>
        <div className="w-full">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
