import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "DebtNote <noreply@debtnote.app>";

type Event = "agreement_signed" | "proof_pending" | "overdue_digest";

async function sendEmail(to: string, subject: string, text: string) {
  if (!RESEND_API_KEY) {
    return { ok: true, sent: false, preview: text };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, text }),
  });
  return { ok: res.ok, sent: res.ok, data: await res.json() };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const body = await req.json();
  const event = body.event as Event;

  if (event === "agreement_signed") {
    const token = String(body.token ?? "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), { status: 400 });
    }
    const { data: agr } = await supabase
      .from("debt_note_agreements")
      .select("borrower_name, owner_user_id, debt_note_records(title)")
      .eq("public_token", token)
      .maybeSingle();
    if (!agr?.owner_user_id) {
      return new Response(JSON.stringify({ ok: false, error: "Agreement not found" }), {
        status: 404,
      });
    }
    const { data: profile } = await supabase
      .from("debt_note_profiles")
      .select("email")
      .eq("id", agr.owner_user_id)
      .maybeSingle();
    const to = profile?.email;
    const title =
      (agr.debt_note_records as { title?: string } | null)?.title ?? "record";
    const borrower = agr.borrower_name ?? "Debtor";
    if (!to) {
      return new Response(JSON.stringify({ ok: false, error: "No lender email" }), { status: 404 });
    }
    const text = `Good news — ${borrower} signed the promissory note for "${title}".\n\nOpen DebtNote to review the record.`;
    const result = await sendEmail(to, `Signed: ${title}`, text);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (event === "proof_pending") {
    const recordId = String(body.recordId ?? "");
    if (!recordId) {
      return new Response(JSON.stringify({ error: "Missing recordId" }), { status: 400 });
    }
    const { data: rec } = await supabase
      .from("debt_note_records")
      .select("title, owner_user_id")
      .eq("id", recordId)
      .maybeSingle();
    if (!rec?.owner_user_id) {
      return new Response(JSON.stringify({ ok: false, error: "Record not found" }), { status: 404 });
    }
    const { data: profile } = await supabase
      .from("debt_note_profiles")
      .select("email")
      .eq("id", rec.owner_user_id)
      .maybeSingle();
    const to = profile?.email;
    const title = rec.title ?? "record";
    if (!to) {
      return new Response(JSON.stringify({ ok: false, error: "No lender email" }), { status: 404 });
    }
    const text = `May proof of payment for "${title}" waiting for your review.\n\nOpen the record in DebtNote to verify or reject.`;
    const result = await sendEmail(to, `Proof to review: ${title}`, text);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (event === "overdue_digest") {
    const { data: rows } = await supabase
      .from("debt_note_installments")
      .select(
        "id, debt_note_records!inner(owner_user_id, title, direction, status)",
      )
      .eq("status", "overdue")
      .eq("debt_note_records.direction", "receivable")
      .eq("debt_note_records.status", "active");

    const byOwner = new Map<string, { titles: Set<string>; count: number }>();
    for (const row of rows ?? []) {
      const rec = (row as {
        debt_note_records?: { owner_user_id?: string; title?: string };
      }).debt_note_records;
      const ownerId = rec?.owner_user_id;
      if (!ownerId) continue;
      const entry = byOwner.get(ownerId) ?? { titles: new Set(), count: 0 };
      entry.count += 1;
      if (rec?.title) entry.titles.add(rec.title);
      byOwner.set(ownerId, entry);
    }

    let sent = 0;
    for (const [ownerId, entry] of byOwner) {
      const { data: profile } = await supabase
        .from("debt_note_profiles")
        .select("email")
        .eq("id", ownerId)
        .maybeSingle();
      if (!profile?.email) continue;
      const list = [...entry.titles].slice(0, 8).join(", ");
      const text = `May ${entry.count} overdue installment(s) in your DebtNote notebook.${
        list ? `\n\nIncluding: ${list}` : ""
      }\n\nOpen DebtNote → Records → Overdue only to follow up.`;
      const result = await sendEmail(profile.email, "DebtNote overdue digest", text);
      if (result.ok) sent += 1;
    }

    return new Response(JSON.stringify({ ok: true, lenders: byOwner.size, sent }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unknown event" }), { status: 400 });
});
