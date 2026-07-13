"use server";

/** Fire-and-forget lender inbox alert via edge function (service role / edge secret). */
export async function notifyLender(payload: {
  event: "agreement_signed" | "proof_pending" | "overdue_digest";
  token?: string;
  recordId?: string;
}): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.DEBTNOTE_EDGE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url}/functions/v1/debt-note-notify-lender`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Alerts must not block the primary user flow.
  }
}
