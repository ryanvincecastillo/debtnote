import "server-only";
import { cache } from "react";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve the tenant project UUID from its slug.
 *
 * `public.projects` is locked behind RLS; resolve tenant UUID via
 * `get_project_id_by_slug` RPC (service-role or anon).
 *
 * Cached per request (React cache) and across warm serverless invocations
 * (module-level) — the slug→UUID mapping is effectively static.
 */
let warmProjectId: string | null = null;
let warmProjectSlug: string | null = null;

export const getProjectId = cache(async (): Promise<string> => {
  const slug = process.env.NEXT_PUBLIC_APP_PROJECT_SLUG ?? "debtnote-dev";

  if (warmProjectId && warmProjectSlug === slug) {
    return warmProjectId;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / key).");
  }

  const admin = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.rpc("get_project_id_by_slug", {
    p_slug: slug,
  });

  if (error || !data) {
    throw new Error(`Project "${slug}" not found: ${error?.message ?? "no row"}`);
  }

  warmProjectId = data as string;
  warmProjectSlug = slug;
  return warmProjectId;
});
