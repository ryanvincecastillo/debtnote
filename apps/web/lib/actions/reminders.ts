"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";
import type { Tone } from "@/lib/types";

async function resolveDebtorEmail(
  supabase: Awaited<ReturnType<typeof actionContext>>["supabase"],
  recordId: string,
): Promise<{ email: string | null; name: string }> {
  const { data: rec } = await supabase
    .from("debt_note_records")
    .select("contact:debt_note_contacts(name, email), agreements:debt_note_agreements(borrower_name, borrower_email)")
    .eq("id", recordId)
    .maybeSingle();

  const contact = rec?.contact as { name?: string; email?: string | null } | null;
  const agreements =
    (rec?.agreements as { borrower_name?: string; borrower_email?: string | null }[] | null) ??
    [];
  const withEmail = agreements.find((a) => a.borrower_email?.trim());

  return {
    email: contact?.email?.trim() || withEmail?.borrower_email?.trim() || null,
    name:
      contact?.name?.trim() ||
      withEmail?.borrower_name?.trim() ||
      agreements[0]?.borrower_name?.trim() ||
      "",
  };
}

export async function scheduleReminder(input: {
  recordId: string;
  installmentId?: string | null;
  tone: Tone;
  scheduledAt: string; // ISO
}): Promise<ActionResult> {
  try {
    const { supabase, user, projectId } = await actionContext();
    const debtor = await resolveDebtorEmail(supabase, input.recordId);
    if (!debtor.email) {
      return {
        ok: false,
        error:
          "Walang email ang debtor. Magdagdag ng email sa contact/agreement, o i-share ang agreement link via WhatsApp.",
      };
    }

    const { error } = await supabase.from("debt_note_reminders").insert({
      project_id: projectId,
      owner_user_id: user.id,
      record_id: input.recordId,
      installment_id: input.installmentId || null,
      channel: "email",
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
