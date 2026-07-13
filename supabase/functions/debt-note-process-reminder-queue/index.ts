import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const edgeSecret = Deno.env.get("DEBTNOTE_EDGE_SECRET") ?? "";

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
  }

  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const allowed =
    (edgeSecret.length > 0 && token === edgeSecret) ||
    (serviceKey.length > 0 && token === serviceKey);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date().toISOString();

  const { data: reminders, error } = await supabase
    .from("debt_note_reminders")
    .select(
      `
      *,
      debt_note_records(
        title,
        balance,
        debt_note_contacts(name, email),
        debt_note_agreements(borrower_name, borrower_email, public_token)
      )
    `,
    )
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let processed = 0;
  for (const reminder of reminders ?? []) {
    const record = reminder.debt_note_records as {
      title?: string;
      balance?: number;
      debt_note_contacts?: { name?: string; email?: string | null } | null;
      debt_note_agreements?:
        | {
            borrower_name?: string;
            borrower_email?: string | null;
            public_token?: string;
          }[]
        | null;
    } | null;

    const contact = record?.debt_note_contacts ?? null;
    const agreements = record?.debt_note_agreements ?? [];
    const agreementWithEmail = agreements.find((a) => a.borrower_email?.trim());
    const agreementWithToken = agreements.find(
      (a) => (a as { public_token?: string }).public_token,
    ) as { public_token?: string; borrower_email?: string | null; borrower_name?: string } | undefined;

    const to =
      contact?.email?.trim() ||
      agreementWithEmail?.borrower_email?.trim() ||
      "";

    const borrower =
      contact?.name?.trim() ||
      agreementWithEmail?.borrower_name?.trim() ||
      agreements[0]?.borrower_name?.trim() ||
      "kaibigan";

    const { data: profile } = await supabase
      .from("debt_note_profiles")
      .select("gcash_number, maya_number")
      .eq("id", reminder.owner_user_id)
      .maybeSingle();

    const paymentBits: string[] = [];
    if (profile?.gcash_number) paymentBits.push(`GCash: ${profile.gcash_number}`);
    if (profile?.maya_number) paymentBits.push(`Maya: ${profile.maya_number}`);
    const paymentHint = paymentBits.length
      ? `Bayad details: ${paymentBits.join(" · ")}`
      : "";

    if (!to) {
      await supabase
        .from("debt_note_reminders")
        .update({
          status: "failed",
          error_message: "No debtor email on contact or agreement",
        })
        .eq("id", reminder.id);
      processed += 1;
      continue;
    }

    const appUrl = Deno.env.get("DEBTNOTE_APP_URL") ?? "https://debtnote.app";
    const publicToken = agreementWithToken?.public_token?.trim();
    const actionUrl = publicToken ? `${appUrl}/a/${publicToken}` : appUrl;
    const actionLabel = publicToken ? "Open your promissory note" : "Open Debt Note";

    const sendAuth = Deno.env.get("DEBTNOTE_EDGE_SECRET") || serviceKey;
    const sendUrl = `${supabaseUrl}/functions/v1/debt-note-send-reminder`;
    const res = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        tone: reminder.tone,
        context: {
          borrower,
          amount: `₱${Number(record?.balance ?? 0).toFixed(2)}`,
          title: record?.title ?? "Utang",
          dueDate: reminder.scheduled_at?.slice(0, 10) ?? "",
          paymentHint,
          actionUrl,
          actionLabel,
        },
      }),
    });

    await supabase
      .from("debt_note_reminders")
      .update({
        status: res.ok ? "sent" : "failed",
        sent_at: res.ok ? now : null,
        error_message: res.ok ? null : await res.text(),
      })
      .eq("id", reminder.id);

    processed += 1;
  }

  return new Response(JSON.stringify({ processed }), {
    headers: { "Content-Type": "application/json" },
  });
});
