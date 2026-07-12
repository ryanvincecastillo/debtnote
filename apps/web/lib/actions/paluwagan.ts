"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";

export async function createPool(input: {
  name: string;
  contributionAmount: number;
  cycleLength: number;
  members: { name: string; contactId?: string | null }[];
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user, projectId } = await actionContext();
    if (!input.name.trim()) return { ok: false, error: "Pool name is required." };
    if (!(input.contributionAmount > 0)) return { ok: false, error: "Contribution must be > 0." };
    if (!(input.cycleLength > 0)) return { ok: false, error: "Cycle length must be > 0." };

    const { data: pool, error: poolErr } = await supabase
      .from("debt_note_paluwagan_pools")
      .insert({
        project_id: projectId,
        owner_user_id: user.id,
        name: input.name.trim(),
        contribution_amount: input.contributionAmount,
        cycle_length: input.cycleLength,
        current_cycle: 1,
        status: "active",
      })
      .select("id")
      .single();
    if (poolErr) return fail(poolErr);

    const members = input.members
      .filter((m) => m.name.trim())
      .map((m, i) => ({
        project_id: projectId,
        owner_user_id: user.id,
        pool_id: pool.id,
        contact_id: m.contactId || null,
        member_name: m.name.trim(),
        payout_order: i + 1,
        has_received_payout: false,
      }));

    if (members.length) {
      const { error: memErr } = await supabase.from("debt_note_paluwagan_members").insert(members);
      if (memErr) return fail(memErr);
    }

    revalidatePath("/app/paluwagan");
    return { ok: true, data: { id: pool.id as string } };
  } catch (e) {
    return fail(e);
  }
}

/** Mark the current cycle's member paid and advance to the next cycle. */
export async function advanceCycle(poolId: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { data: pool, error } = await supabase
      .from("debt_note_paluwagan_pools")
      .select("id, current_cycle, cycle_length")
      .eq("id", poolId)
      .single();
    if (error) return fail(error);

    // Mark the member whose payout_order matches the current cycle as paid.
    await supabase
      .from("debt_note_paluwagan_members")
      .update({ has_received_payout: true })
      .eq("pool_id", poolId)
      .eq("payout_order", pool.current_cycle);

    const next = (pool.current_cycle as number) + 1;
    const done = next > (pool.cycle_length as number);
    const { error: upErr } = await supabase
      .from("debt_note_paluwagan_pools")
      .update({
        current_cycle: done ? pool.cycle_length : next,
        status: done ? "completed" : "active",
        updated_at: new Date().toISOString(), // no trigger on this table
      })
      .eq("id", poolId);
    if (upErr) return fail(upErr);

    revalidatePath("/app/paluwagan");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
