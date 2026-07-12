import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date().toISOString();

  const { data: reminders, error } = await supabase
    .from("debt_note_reminders")
    .select("*, debt_note_records(title, balance), debt_note_profiles:owner_user_id(email)")
    .eq("status", "pending")
    .lte("scheduled_at", now)
    .limit(50);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  let processed = 0;
  for (const reminder of reminders ?? []) {
    const sendUrl = `${supabaseUrl}/functions/v1/debt-note-send-reminder`;
    const res = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: reminder.debt_note_profiles?.email,
        tone: reminder.tone,
        context: {
          borrower: "Friend",
          amount: `₱${Number(reminder.debt_note_records?.balance ?? 0).toFixed(2)}`,
          title: reminder.debt_note_records?.title ?? "Utang",
          dueDate: reminder.scheduled_at?.slice(0, 10) ?? "",
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
