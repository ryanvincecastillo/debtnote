"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getProjectId } from "@/lib/project";
import { PROOF_BUCKET } from "@/lib/storage";
import { fail, type ActionResult } from "@/lib/actions/context";

export type DeleteAccountResult = {
  authDeleted: boolean;
  sharedLoginKept: boolean;
};

async function wipeProofFolder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: { storage: { from: (bucket: string) => any } },
  userId: string,
) {
  const { data: top } = await admin.storage.from(PROOF_BUCKET).list(userId, { limit: 1000 });
  if (!top?.length) return;
  const paths: string[] = [];
  for (const entry of top as { id: string | null; name: string }[]) {
    if (entry.id === null) {
      const { data: files } = await admin.storage
        .from(PROOF_BUCKET)
        .list(`${userId}/${entry.name}`, { limit: 1000 });
      for (const f of (files ?? []) as { name: string }[]) {
        if (f.name) paths.push(`${userId}/${entry.name}/${f.name}`);
      }
    } else if (entry.name) {
      paths.push(`${userId}/${entry.name}`);
    }
  }
  if (paths.length) await admin.storage.from(PROOF_BUCKET).remove(paths);
}

/** Permanently delete DebtNote data (+ Auth user if no other app memberships). */
export async function deleteAccount(): Promise<ActionResult<DeleteAccountResult>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const projectId = await getProjectId();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return { ok: false, error: "Server misconfigured for account deletion" };
    }

    const admin = createServiceClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
      await wipeProofFolder(admin, user.id);
    } catch {
      // Continue — DB wipe still matters more than orphaned files.
    }

    const { data, error } = await supabase.rpc("debt_note_delete_account", {
      p_project_id: projectId,
    });
    if (error) return fail(error);

    const deleteAuth = Boolean((data as { delete_auth?: boolean } | null)?.delete_auth);
    let authDeleted = false;
    if (deleteAuth) {
      const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
      if (delErr) {
        await supabase.auth.signOut();
        return {
          ok: true,
          data: { authDeleted: false, sharedLoginKept: true },
        };
      }
      authDeleted = true;
    }

    await supabase.auth.signOut();
    return {
      ok: true,
      data: { authDeleted, sharedLoginKept: !authDeleted },
    };
  } catch (e) {
    return fail(e);
  }
}
