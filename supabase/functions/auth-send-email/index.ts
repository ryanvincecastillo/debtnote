import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "npm:standardwebhooks@1.0.0";
import {
  authEmailSubject,
  type AuthEmailPayload,
  renderAuthEmailHtml,
  resolveAuthApp,
} from "./templates.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM = Deno.env.get("RESEND_FROM_EMAIL") ?? "InaanApp <noreply@ryanvincecastillo.com>";
const HOOK_SECRET_RAW = Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), { status: 500 });
  }

  if (!HOOK_SECRET_RAW) {
    return new Response(JSON.stringify({ error: "SEND_EMAIL_HOOK_SECRET missing" }), { status: 500 });
  }

  const hookSecret = HOOK_SECRET_RAW.replace(/^v1,whsec_/, "");
  const payloadText = await req.text();
  const headers = Object.fromEntries(req.headers);

  let body: AuthEmailPayload;
  try {
    const wh = new Webhook(hookSecret);
    body = wh.verify(payloadText, headers) as AuthEmailPayload;
  } catch (error) {
    console.error("Webhook verification failed", error);
    return new Response(JSON.stringify({ error: "Invalid webhook signature" }), { status: 401 });
  }

  const app = resolveAuthApp(body);
  console.log(
    JSON.stringify({
      resolved_app: app,
      redirect_to: body.email_data.redirect_to,
      site_url: body.email_data.site_url,
      meta_app: body.user.user_metadata?.app ?? null,
      meta_app_origin: body.user.user_metadata?.app_origin ?? null,
      email_action_type: body.email_data.email_action_type,
      to: body.user.email,
    }),
  );
  const action = body.email_data.email_action_type ?? "email";
  const token = body.email_data.token;
  const html = renderAuthEmailHtml(app, token, action);
  const subject = authEmailSubject(app, action);

  const from =
    app === "debtnote"
      ? (Deno.env.get("DEBTNOTE_FROM_EMAIL") ?? "Debt Note App <noreply@ryanvincecastillo.com>")
      : app === "inaanapp"
        ? (Deno.env.get("INAANAPP_FROM_EMAIL") ?? "InaanApp <noreply@ryanvincecastillo.com>")
        : RESEND_FROM;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [body.user.email],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend failed", detail);
    return new Response(JSON.stringify({ error: detail }), { status: 502 });
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
