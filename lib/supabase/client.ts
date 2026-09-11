import { createBrowserClient } from "@supabase/ssr";

// NOTE: literal process.env.NEXT_PUBLIC_* access only. Bundlers inline env
// vars for static member expressions — dynamic process.env[name] does NOT get
// replaced in browser bundles, which throws at click time.

// Browser-side client. Auth session is stored in cookies (managed by proxy.ts),
// so sign-in state survives server rendering.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_*).");
  }
  return createBrowserClient(url, anonKey);
}
