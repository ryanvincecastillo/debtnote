"use server";

import { revalidatePath } from "next/cache";
import { actionContext, fail, type ActionResult } from "@/lib/actions/context";

/** Create a public promissory-note agreement for a record. Returns the shareable token. */
export async function createAgreement(input: {
  recordId: string;
  borrowerName: string;
  borrowerEmail?: string | null;
  expiresAt?: string | null; // ISO
}): Promise<ActionResult<{ token: string }>> {
  try {
    const { supabase, user, projectId } = await actionContext();
    if (!input.borrowerName.trim()) return { ok: false, error: "Borrower name is required." };

    const { data, error } = await supabase
      .from("debt_note_agreements")
      .insert({
        project_id: projectId,
        owner_user_id: user.id,
        record_id: input.recordId,
        borrower_name: input.borrowerName.trim(),
        borrower_email: input.borrowerEmail || null,
        expires_at: input.expiresAt || null,
      })
      .select("public_token")
      .single();
    if (error) return fail(error);

    revalidatePath(`/app/records/${input.recordId}`);
    return { ok: true, data: { token: data.public_token as string } };
  } catch (e) {
    return fail(e);
  }
}
