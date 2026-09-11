"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
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
