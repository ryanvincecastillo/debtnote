import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  DEBTNOTE_APP_URL,
  p,
  renderDebtNoteEmail,
} from "../_shared/debtnote-email.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM =
  Deno.env.get("DEBTNOTE_FROM_EMAIL") ??
  "Debt Note App <noreply@ryanvincecastillo.com>";

type Event = "agreement_signed" | "proof_pending" | "overdue_digest";

async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!RESEND_API_KEY) {
    return { ok: true, sent: false, preview: text };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html, text }),
  });
  return { ok: res.ok, sent: res.ok, data: await res.json() };
}

function bearerToken(req: Request): string {
  const header = req.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const edgeSecret = Deno.env.get("DEBTNOTE_EDGE_SECRET") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
  }

  const token = bearerToken(req);
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const isPrivileged =
    (edgeSecret.length > 0 && token === edgeSecret) ||
    (serviceKey.length > 0 && token === serviceKey);
  let callerUserId: string | null = null;

  if (!isPrivileged) {
    const userClient = createClient(supabaseUrl, anonKey || serviceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    callerUserId = userData.user.id;
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const body = await req.json();
  const event = body.event as Event;

  if (event === "overdue_digest" && !isPrivileged) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  if (event === "agreement_signed") {
    if (!isPrivileged) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }
    const publicToken = String(body.token ?? "");
    if (!publicToken) {
      return new Response(JSON.stringify({ error: "Missing token" }), { status: 400 });
    }
    const { data: agr } = await supabase
      .from("debt_note_agreements")
      .select("borrower_name, owner_user_id, record_id, debt_note_records(title)")
      .eq("public_token", publicToken)
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

    const actionUrl = agr.record_id
      ? `${DEBTNOTE_APP_URL}/records/${agr.record_id}`
      : `${DEBTNOTE_APP_URL}/records`;
    const paragraphs = [
      `Good news — ${borrower} just signed the promissory note for “${title}”.`,
      "The page is written. Open the record to review the signature and keep collection moving.",
    ];
    const { html, text } = renderDebtNoteEmail({
      headline: "A signature landed in the notebook",
      bodyHtml: paragraphs.map((line, i) => p(line, i > 0)).join(""),
      bodyText: paragraphs,
      detailRows: [
        { label: "Borrower", value: borrower },
        { label: "Record", value: title },
      ],
      actionUrl,
      actionLabel: "Open record",
    });
    const result = await sendEmail(to, `Signed — ${title}`, html, text);
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
    if (callerUserId && rec.owner_user_id !== callerUserId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
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

    const actionUrl = `${DEBTNOTE_APP_URL}/records/${recordId}`;
    const paragraphs = [
      `May proof of payment waiting for “${title}”.`,
      "Reminders are frozen while you review. Verify if it’s legit — or reject and the notebook keeps nudging.",
    ];
    const { html, text } = renderDebtNoteEmail({
      headline: "Proof is waiting on your desk",
      bodyHtml: paragraphs.map((line, i) => p(line, i > 0)).join(""),
      bodyText: paragraphs,
      detailRows: [{ label: "Record", value: title }],
      actionUrl,
      actionLabel: "Review proof",
    });
    const result = await sendEmail(to, `Proof to review — ${title}`, html, text);
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (event === "overdue_digest") {
    const { data: rows } = await supabase
      .from("debt_note_installments")
      .select(
        "id, debt_note_records!inner(id, owner_user_id, title, direction, status)",
      )
      .eq("status", "overdue")
      .eq("debt_note_records.direction", "receivable")
      .eq("debt_note_records.status", "active");

    const byOwner = new Map<
      string,
      { titles: Set<string>; count: number; firstRecordId?: string }
    >();
    for (const row of rows ?? []) {
      const rec = (row as {
        debt_note_records?: { id?: string; owner_user_id?: string; title?: string };
      }).debt_note_records;
      const ownerId = rec?.owner_user_id;
      if (!ownerId) continue;
      const entry = byOwner.get(ownerId) ?? { titles: new Set(), count: 0 };
      entry.count += 1;
      if (rec?.title) entry.titles.add(rec.title);
      if (!entry.firstRecordId && rec?.id) entry.firstRecordId = rec.id;
      byOwner.set(ownerId, entry);
    }

    let sent = 0;
    const actionUrl = `${DEBTNOTE_APP_URL}/records?overdue=1`;
    for (const [ownerId, entry] of byOwner) {
      const { data: profile } = await supabase
        .from("debt_note_profiles")
        .select("email")
        .eq("id", ownerId)
        .maybeSingle();
      if (!profile?.email) continue;
      const list = [...entry.titles].slice(0, 8);
      const paragraphs = [
        `May ${entry.count} overdue installment${entry.count === 1 ? "" : "s"} sitting in your notebook.`,
        list.length
          ? `Including: ${list.join(", ")}.`
          : "Open Records → Overdue only to follow up before the pages pile up.",
        "A short nudge today beats an awkward conversation next week.",
      ];
      const { html, text } = renderDebtNoteEmail({
        headline: "Overdue pages need attention",
        bodyHtml: paragraphs.map((line, i) => p(line, i > 0)).join(""),
        bodyText: paragraphs,
        detailRows: [
          { label: "Overdue", value: String(entry.count) },
          ...(list[0] ? [{ label: "Example", value: list[0] }] : []),
        ],
        actionUrl,
        actionLabel: "View overdue records",
      });
      const result = await sendEmail(
        profile.email,
        "Debt Note — overdue digest",
        html,
        text,
      );
      if (result.ok) sent += 1;
    }

    return new Response(JSON.stringify({ ok: true, lenders: byOwner.size, sent }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unknown event" }), { status: 400 });
});
