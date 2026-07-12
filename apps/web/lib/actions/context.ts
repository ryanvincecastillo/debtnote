import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getProjectId } from "@/lib/project";

/** Shared server-action context: authed supabase client, user, tenant project id. */
export async function actionContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const projectId = await getProjectId();
  return { supabase, user, projectId };
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export function fail(error: unknown): { ok: false; error: string } {
  const msg = error instanceof Error ? error.message : String(error);
  return { ok: false, error: msg };
}
