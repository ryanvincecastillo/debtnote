"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";

/**
 * Record a proof-of-payment submission via RPC (freezes pending reminders).
 * The file must already be uploaded to `debt-note-proofs` at `<auth-uid>/...`
 * by the browser client (storage RLS keys on the uid folder).
 */
export async function submitProof(input: {
  recordId: string;
  storagePath: string;
}): Promise<ActionResult> {
  try {
    const { supabase, projectId } = await actionContext();
    const { error } = await supabase.rpc("debt_note_submit_proof", {
      p_project_id: projectId,
      p_record_id: input.recordId,
      p_storage_path: input.storagePath,
    });
    if (error) return fail(error);
    revalidatePath(`/app/records/${input.recordId}`);
    revalidatePath("/app/reminders");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
