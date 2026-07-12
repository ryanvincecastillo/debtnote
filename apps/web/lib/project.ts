import "server-only";
import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve the tenant project UUID from its slug.
 *
 * `public.projects` has RLS disabled and is not meant to be exposed via the
 * anon/authenticated PostgREST API, so we resolve it with the service-role key
 * server-side (falls back to anon if the service key is absent). Cached per request.
 */
export const getProjectId = cache(async (): Promise<string> => {
  const slug = process.env.NEXT_PUBLIC_APP_PROJECT_SLUG ?? "debtnote-dev";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / key).");
  }

  const admin = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin
    .from("projects")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    throw new Error(`Project "${slug}" not found: ${error?.message ?? "no row"}`);
  }

  return data.id as string;
});
