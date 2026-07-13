"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";
import type { Tone } from "@/lib/types";

export async function updateProfile(input: {
  displayName: string;
  gcashNumber?: string | null;
  mayaNumber?: string | null;
  defaultTone: Tone;
}): Promise<ActionResult> {
  try {
    const { supabase, user } = await actionContext();
    const { error } = await supabase
      .from("debt_note_profiles")
      .update({
        display_name: input.displayName.trim(),
        gcash_number: input.gcashNumber || null,
        maya_number: input.mayaNumber || null,
        default_tone: input.defaultTone,
      })
      .eq("id", user.id);
    if (error) return fail(error);
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
