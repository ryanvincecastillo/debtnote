export type AuthApp = "debtnote" | "inaanapp" | "yes-honey" | "avocado-go" | "default";

type Identity = {
  identity_data?: Record<string, unknown>;
};

export type AuthEmailPayload = {
  user: {
    email: string;
    user_metadata?: Record<string, unknown>;
    identities?: Identity[];
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
};

function matchAppFromString(value: string): AuthApp | null {
  const v = value.toLowerCase();
  if (v.includes("debtnote") || v.includes("debt-note")) return "debtnote";
  if (v.includes("inaanapp") || v.includes("inaan")) return "inaanapp";
  if (v.includes("yes-honey") || v.includes("yeshoney")) return "yes-honey";
  if (v.includes("avocado")) return "avocado-go";
  return null;
}

export function resolveAuthApp(payload: AuthEmailPayload): AuthApp {
  // Current sign-in request wins over stored user metadata (shared Supabase project).
  const fromRedirect = matchAppFromString(payload.email_data.redirect_to ?? "");
  if (fromRedirect) return fromRedirect;

  const meta = payload.user.user_metadata ?? {};
  const fromMeta = matchAppFromString(String(meta.app ?? meta.app_origin ?? ""));
  if (fromMeta) return fromMeta;

  for (const identity of payload.user.identities ?? []) {
    const data = identity.identity_data ?? {};
    const fromIdentity = matchAppFromString(String(data.app ?? data.app_origin ?? ""));
    if (fromIdentity) return fromIdentity;
  }

  return "inaanapp";
}

export function authEmailSubject(app: AuthApp, action: string): string {
  if (app === "debtnote") {
    if (action === "recovery") return "Debt Note App — reset your access";
    return "Debt Note App — your login code";
  }
  if (action === "recovery") return "InaanApp — reset your password";
  return "InaanApp — your login code";
}

export function debtNoteAuthEmailHtml(token: string, action: string): string {
  const headline =
    action === "recovery" ? "Reset access to the notebook" : "Your login code has been written";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000000;font-family:Georgia,'Times New Roman',serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;border:1px solid #333;background:#000000;">
        <tr><td style="padding:32px 28px 8px;border-bottom:1px solid #222;">
          <div style="font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#888;margin-bottom:18px;">Debt Note App</div>
          <div style="font-size:34px;font-weight:700;letter-spacing:0.08em;line-height:1.05;color:#ffffff;">DEBT<br>NOTE</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#e8e8e8;">${headline}.</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#aaaaaa;">Enter this code in Debt Note App to continue. It expires soon.</p>
          <div style="display:inline-block;padding:18px 28px;border:1px solid #ffffff;background:#0a0a0a;font-size:32px;letter-spacing:0.35em;font-family:monospace;color:#ffffff;">${token}</div>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#666;">If you did not request this, ignore this email. The notebook only opens for you.</p>
        </td></tr>
        <tr><td style="padding:16px 28px 28px;border-top:1px solid #222;font-size:11px;color:#555;">Collect without the awkwardness · Debt Note App</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function inaanAppAuthEmailHtml(token: string, action: string): string {
  const headline = action === "recovery" ? "Reset your InaanApp password" : "Your InaanApp login code";
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F7F4EF;font-family:Arial,sans-serif;color:#2A2A2A;">
  <div style="max-width:520px;margin:0 auto;padding:32px 16px;">
    <div style="background:#ffffff;border-radius:16px;padding:28px;border:1px solid #EFE7E1;">
      <h2 style="margin:0 0 8px;color:#E8735C;">InaanApp</h2>
      <p style="margin:0 0 16px;">${headline}</p>
      <div style="font-size:28px;letter-spacing:0.25em;font-family:monospace;padding:12px 0;">${token}</div>
      <p style="margin:16px 0 0;font-size:12px;color:#7A7A7A;">If you did not request this, you can ignore this email.</p>
    </div>
  </div>
</body>
</html>`;
}

export function renderAuthEmailHtml(app: AuthApp, token: string, action: string): string {
  if (app === "debtnote") return debtNoteAuthEmailHtml(token, action);
  return inaanAppAuthEmailHtml(token, action);
}
