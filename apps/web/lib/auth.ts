import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProjectId } from "@/lib/project";
import type { DebtNoteProfile } from "@/lib/types";

/** Current authenticated user (or null). Cached per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Require auth or redirect to /login. Returns the user. */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Idempotently ensure a DebtNote profile + project membership exist for the
 * current user (RPC seeds project_members role 'owner' + debt_note_profiles).
 * Call once after login.
 */
export async function ensureProfile(displayName = ""): Promise<void> {
  const supabase = await createClient();
  const projectId = await getProjectId();
  await supabase.rpc("debt_note_ensure_profile", {
    p_project_id: projectId,
    p_display_name: displayName,
  });
}

/** The current user's DebtNote profile (ensures it exists first). Cached per request. */
export const getProfile = cache(async (): Promise<DebtNoteProfile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("debt_note_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Always ensure (also syncs email after Auth email_change).
  if (!existing || (user.email && existing.email !== user.email)) {
    await ensureProfile(user.email?.split("@")[0] ?? "");
    const { data } = await supabase
      .from("debt_note_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return (data as DebtNoteProfile) ?? null;
  }

  return existing as DebtNoteProfile;
});
