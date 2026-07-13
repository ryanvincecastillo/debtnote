"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";

export async function submitProof(input: {
  recordId: string;
  storagePath: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, projectId } = await actionContext();
    const { data, error } = await supabase.rpc("debt_note_submit_proof", {
      p_project_id: projectId,
      p_record_id: input.recordId,
      p_storage_path: input.storagePath,
    });
    if (error) return fail(error);
    revalidatePath(`/records/${input.recordId}`);
    revalidatePath("/reminders");
    return { ok: true, data: { id: data as string } };
  } catch (e) {
    return fail(e);
  }
}

export async function reviewProof(input: {
  proofId: string;
  recordId: string;
  decision: "verified" | "rejected";
}): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase
      .from("debt_note_proof_submissions")
      .update({
        status: input.decision,
        verified_at: input.decision === "verified" ? new Date().toISOString() : null,
      })
      .eq("id", input.proofId);
    if (error) return fail(error);

    if (input.decision === "verified") {
      // Unfreeze reminders that were paused for this record.
      await supabase
        .from("debt_note_reminders")
        .update({ status: "pending" })
        .eq("record_id", input.recordId)
        .eq("status", "frozen");
    }

    revalidatePath(`/records/${input.recordId}`);
    revalidatePath("/reminders");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
