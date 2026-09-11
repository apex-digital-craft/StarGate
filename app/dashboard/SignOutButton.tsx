"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({ compact }: { compact?: boolean }) {
  const router = useRouter();

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={onSignOut}
        className="h-9 shrink-0 rounded-full border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-700"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      className="mt-6 h-12 w-full rounded-full border border-zinc-300 bg-white text-base font-semibold text-zinc-800"
    >
      Sign out
    </button>
  );
}
