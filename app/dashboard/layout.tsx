import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "./DashboardNav";
import SignOutButton from "./SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: shops } = await supabase
    .from("merchants")
    .select("shop_name")
    .order("created_at", { ascending: false });
  const shopName = shops?.[0]?.shop_name ?? "Owner dashboard";

  return (
    <div className="min-h-dvh bg-zinc-50 font-sans">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-6 py-3">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest text-brand-700">
              STARGATE
            </p>
            <p className="truncate text-sm font-semibold text-zinc-900">
              {shopName}
            </p>
          </div>
          <SignOutButton compact />
        </div>
        <div className="mx-auto w-full max-w-md px-4">
          <DashboardNav />
        </div>
      </header>
      {children}
    </div>
  );
}
