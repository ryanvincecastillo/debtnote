import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  DEBTNOTE_APP_URL,
  p,
  renderDebtNoteEmail,
} from "../_shared/debtnote-email.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM =
  Deno.env.get("DEBTNOTE_FROM_EMAIL") ??
  "Debt Note App <noreply@ryanvincecastillo.com>";

type ReminderContext = {
  borrower: string;
  amount: string;
  title: string;
  dueDate: string;
  paymentHint?: string;
  actionUrl?: string;
  actionLabel?: string;
};

const toneCopy: Record<
  string,
  (ctx: ReminderContext) => { headline: string; paragraphs: string[] }
> = {
  taglish_casual: (ctx) => ({
    headline: `Hoy ${ctx.borrower} — friendly reminder lang`,
    paragraphs: [
      `May due payment ka na amounting to ${ctx.amount} for “${ctx.title}” on ${ctx.dueDate}.`,
      `Kung okay na, bayaran mo na when you can. Salamat — the notebook remembers the good ones too.`,
    ],
  }),
  corporate: (ctx) => ({
    headline: `Payment notice for ${ctx.borrower}`,
    paragraphs: [
      `This is a formal notice regarding your obligation of ${ctx.amount} for “${ctx.title}”, due ${ctx.dueDate}.`,
      `Please settle at your earliest convenience. A written record helps keep the relationship clean.`,
    ],
  }),
  assertive: (ctx) => ({
    headline: `${ctx.borrower}, payment is overdue`,
    paragraphs: [
      `Your ${ctx.amount} payment for “${ctx.title}” was due ${ctx.dueDate}.`,
      `Please pay today so we don’t have to write another page about this.`,
    ],
  }),
  shinigami: (ctx) => ({
    headline: `The notebook has written your name, ${ctx.borrower}`,
    paragraphs: [
      `Ang utang na ${ctx.amount} para sa “${ctx.title}” ay due na (${ctx.dueDate}).`,
      `Huwag palampasin — ang notebook ay nakatutok. Settle, and the page turns.`,
    ],
  }),
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const edgeSecret = Deno.env.get("DEBTNOTE_EDGE_SECRET") ?? "";
  const header = req.headers.get("Authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const allowed =
    (edgeSecret.length > 0 && bearer === edgeSecret) ||
    (serviceKey.length > 0 && bearer === serviceKey);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json();
  const { to, tone, context } = body as {
    to: string;
    tone: string;
    context: ReminderContext;
  };

  if (!to || !tone || !context) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const copy = (toneCopy[tone] ?? toneCopy.taglish_casual)(context);
  const paragraphs = [...copy.paragraphs];
  if (context.paymentHint?.trim()) {
    paragraphs.push(context.paymentHint.trim());
  }

  const actionUrl = context.actionUrl?.trim() || DEBTNOTE_APP_URL;
  const actionLabel = context.actionLabel?.trim() || "Open Debt Note";

  const { html, text } = renderDebtNoteEmail({
    headline: copy.headline,
    bodyHtml: paragraphs.map((line, i) => p(line, i > 0)).join(""),
    bodyText: paragraphs,
    detailRows: [
      { label: "Amount", value: context.amount },
      { label: "For", value: context.title },
      { label: "Due", value: context.dueDate || "soon" },
    ],
    actionUrl,
    actionLabel,
    footerNote: "A page from the notebook · Debt Note App",
  });

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: true, preview: text, sent: false }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject: `Debt Note — ${context.title ?? "payment due"}`,
      html,
      text,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify({ ok: res.ok, data, sent: res.ok }), {
    status: res.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
});
