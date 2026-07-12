"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";

export interface ContactInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export async function createContact(input: ContactInput): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user, projectId } = await actionContext();
    if (!input.name.trim()) return { ok: false, error: "Name is required." };

    const { data, error } = await supabase
      .from("debt_note_contacts")
      .insert({
        project_id: projectId,
        owner_user_id: user.id,
        name: input.name.trim(),
        phone: input.phone || null,
        email: input.email || null,
        notes: input.notes || null,
      })
      .select("id")
      .single();
    if (error) return fail(error);

    revalidatePath("/app/contacts");
    return { ok: true, data: { id: data.id as string } };
  } catch (e) {
    return fail(e);
  }
}

export async function updateContact(id: string, input: ContactInput): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    if (!input.name.trim()) return { ok: false, error: "Name is required." };

    const { error } = await supabase
      .from("debt_note_contacts")
      .update({
        name: input.name.trim(),
        phone: input.phone || null,
        email: input.email || null,
        notes: input.notes || null,
      })
      .eq("id", id);
    if (error) return fail(error);

    revalidatePath("/app/contacts");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteContact(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await actionContext();
    const { error } = await supabase.from("debt_note_contacts").delete().eq("id", id);
    if (error) return fail(error);
    revalidatePath("/app/contacts");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
