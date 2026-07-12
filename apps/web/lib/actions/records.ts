"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";
import type { Direction, ScheduleType } from "@/lib/types";

export interface CreateRecordInput {
  direction: Direction;
  title: string;
  principal: number;
  scheduleType: ScheduleType;
  installmentCount?: number;
  startDate?: string; // yyyy-mm-dd
  contactId?: string | null;
  notes?: string | null;
}

/** Create a record + its installment schedule via the side-effecting RPC. Returns the new record id. */
export async function createRecord(input: CreateRecordInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, projectId } = await actionContext();
    if (!input.title.trim()) return { ok: false, error: "Title is required." };
    if (!(input.principal > 0)) return { ok: false, error: "Amount must be greater than zero." };

    const { data, error } = await supabase.rpc("debt_note_create_record_with_schedule", {
      p_project_id: projectId,
      p_contact_id: input.contactId || null,
      p_direction: input.direction,
      p_title: input.title.trim(),
      p_principal: input.principal,
      p_schedule_type: input.scheduleType,
      p_installment_count: input.installmentCount ?? 1,
      p_start_date: input.startDate || new Date().toISOString().slice(0, 10),
      p_notes: input.notes || null,
    });
    if (error) return fail(error);

    revalidatePath("/app/records");
    revalidatePath("/app");
    return { ok: true, data: { id: data as string } };
  } catch (e) {
    return fail(e);
  }
}

/** Log a payment against a record (RPC decrements balance + flips statuses). */
export async function recordPayment(input: {
  recordId: string;
  amount: number;
  installmentId?: string | null;
  notes?: string | null;
}): Promise<ActionResult> {
  try {
    const { supabase, projectId } = await actionContext();
    if (!(input.amount > 0)) return { ok: false, error: "Payment must be greater than zero." };

    const { error } = await supabase.rpc("debt_note_record_payment", {
      p_project_id: projectId,
      p_record_id: input.recordId,
      p_amount: input.amount,
      p_installment_id: input.installmentId || null,
      p_notes: input.notes || null,
    });
    if (error) return fail(error);

    revalidatePath(`/app/records/${input.recordId}`);
    revalidatePath("/app/records");
    revalidatePath("/app");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Cancel a record (soft — status='cancelled'). */
export async function cancelRecord(recordId: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase
      .from("debt_note_records")
      .update({ status: "cancelled" })
      .eq("id", recordId);
    if (error) return fail(error);
    revalidatePath(`/app/records/${recordId}`);
    revalidatePath("/app/records");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
