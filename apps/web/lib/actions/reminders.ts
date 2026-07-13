"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";
import type { Tone } from "@/lib/types";

export async function scheduleReminder(input: {
  recordId: string;
  installmentId?: string | null;
  tone: Tone;
  scheduledAt: string; // ISO
}): Promise<ActionResult> {
  try {
    const { supabase, user, projectId } = await actionContext();
    const { error } = await supabase.from("debt_note_reminders").insert({
      project_id: projectId,
      owner_user_id: user.id,
      record_id: input.recordId,
      installment_id: input.installmentId || null,
      channel: "email", // SMS is "coming soon"
      tone: input.tone,
      scheduled_at: input.scheduledAt,
      status: "pending",
    });
    if (error) return fail(error);
    revalidatePath(`/records/${input.recordId}`);
    revalidatePath("/reminders");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function cancelReminder(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase
      .from("debt_note_reminders")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) return fail(error);
    revalidatePath("/reminders");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
