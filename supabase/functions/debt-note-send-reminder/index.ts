import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "DebtNote <noreply@debtnote.app>";

const toneTemplates: Record<string, (ctx: Record<string, string>) => string> = {
  taglish_casual: (ctx) =>
    `Hi ${ctx.borrower}! Friendly reminder from DebtNote: your payment of ${ctx.amount} for "${ctx.title}" is due on ${ctx.dueDate}. Salamat!`,
  corporate: (ctx) =>
    `Dear ${ctx.borrower}, this is a formal notice regarding your obligation of ${ctx.amount} for "${ctx.title}" due ${ctx.dueDate}. Please settle at your earliest convenience.`,
  assertive: (ctx) =>
    `${ctx.borrower}, your ${ctx.amount} payment for "${ctx.title}" was due ${ctx.dueDate}. Please pay today to avoid further follow-ups.`,
  shinigami: (ctx) =>
    `${ctx.borrower}... ang utang na ${ctx.amount} para sa "${ctx.title}" ay due na (${ctx.dueDate}). Huwag palampasin — ang notebook ay nakatutok.`,
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const body = await req.json();
  const { to, tone, context } = body as {
    to: string;
    tone: string;
    context: Record<string, string>;
  };

  if (!to || !tone || !context) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const template = toneTemplates[tone] ?? toneTemplates.taglish_casual;
  const message = template(context);

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ ok: true, preview: message, sent: false }), {
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
      subject: `DebtNote reminder: ${context.title ?? "Payment due"}`,
      text: message,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify({ ok: res.ok, data, sent: res.ok }), {
    status: res.ok ? 200 : 502,
    headers: { "Content-Type": "application/json" },
  });
});
