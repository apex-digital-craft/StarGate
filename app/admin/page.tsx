import { createClient } from "@supabase/supabase-js";
import AdminClient, { type AdminMerchant } from "./AdminClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ key?: string }>;
};

async function getMerchantsWithCounts(): Promise<AdminMerchant[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server env vars are not set.");
  const service = createClient(url, key);

  const { data: merchants, error } = await service
    .from("merchants")
    .select("id, slug, shop_name, freebie_title, owner_id")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows: AdminMerchant[] = [];
  for (const m of merchants ?? []) {
    const [{ count: feedbacks }, { count: clicks }, ownerEmail] =
      await Promise.all([
        service
          .from("feedbacks")
          .select("id", { count: "exact", head: true })
          .eq("merchant_id", m.id),
        service
          .from("review_clicks")
          .select("id", { count: "exact", head: true })
          .eq("merchant_id", m.id),
        m.owner_id
          ? service.auth.admin
              .getUserById(m.owner_id)
              .then(
                (r) => r.data.user?.email ?? null,
                () => null
              )
          : Promise.resolve(null),
      ]);
    rows.push({
      id: m.id,
      slug: m.slug,
      shop_name: m.shop_name,
      freebie_title: m.freebie_title,
      feedbackCount: feedbacks ?? 0,
      clickCount: clicks ?? 0,
      owner_email: ownerEmail,
    });
  }
  return rows;
}

export default async function AdminPage({ searchParams }: Props) {
  const { key } = await searchParams;
  if (!process.env.ADMIN_SECRET || key !== process.env.ADMIN_SECRET) {
    return (
      <main className="min-h-dvh bg-zinc-50 font-sans">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">Unauthorized</h1>
          <p className="mt-2 text-zinc-600">
            This admin page needs a valid <code>?key=...</code> link.
          </p>
        </div>
      </main>
    );
  }

  const merchants = await getMerchantsWithCounts();
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

  return (
    <AdminClient
      adminKey={key}
      baseUrl={baseUrl}
      initialMerchants={merchants}
    />
  );
}
