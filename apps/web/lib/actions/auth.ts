"use server";

import { ensureProfile, getUser } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/actions/context";

/** Provision project membership + profile for the just-authenticated user. */
export async function ensureProfileAction(): Promise<ActionResult> {
  try {
    const user = await getUser();
    if (!user) return { ok: false, error: "Not authenticated" };
    await ensureProfile(user.email?.split("@")[0] ?? "");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}
