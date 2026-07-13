/** Shared Debt Note App email chrome — matches OTP branding (black notebook). */

export const DEBTNOTE_APP_URL =
  Deno.env.get("DEBTNOTE_APP_URL") ?? "https://debtnote.app";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type DebtNoteEmailParts = {
  eyebrow?: string;
  headline: string;
  bodyHtml: string;
  /** Plain paragraphs for text/plain fallback (joined with blank lines). */
  bodyText: string[];
  detailRows?: { label: string; value: string }[];
  actionUrl?: string;
  actionLabel?: string;
  footerNote?: string;
};

export function renderDebtNoteEmail(parts: DebtNoteEmailParts): { html: string; text: string } {
  const eyebrow = escapeHtml(parts.eyebrow ?? "Debt Note App");
  const headline = escapeHtml(parts.headline);
  const footer = escapeHtml(
    parts.footerNote ?? "Collect without the awkwardness · Debt Note App",
  );

  const details =
    parts.detailRows && parts.detailRows.length > 0
      ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 22px;border:1px solid #2a2a2a;">
          ${parts.detailRows
            .map(
              (row) => `<tr>
              <td style="padding:10px 14px;border-bottom:1px solid #222;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#777;width:34%;">${escapeHtml(row.label)}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #222;font-size:15px;color:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">${escapeHtml(row.value)}</td>
            </tr>`,
            )
            .join("")}
        </table>`
      : "";

  const cta =
    parts.actionUrl && parts.actionLabel
      ? `<div style="margin:28px 0 8px;">
          <a href="${escapeHtml(parts.actionUrl)}" style="display:inline-block;padding:14px 22px;border:1px solid #ffffff;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(parts.actionLabel)}</a>
        </div>
        <p style="margin:0;font-size:11px;line-height:1.5;color:#555;word-break:break-all;">${escapeHtml(parts.actionUrl)}</p>`
      : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#000000;font-family:Georgia,'Times New Roman',serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;border:1px solid #333;background:#000000;">
        <tr><td style="padding:32px 28px 8px;border-bottom:1px solid #222;">
          <div style="font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#888;margin-bottom:18px;">${eyebrow}</div>
          <div style="font-size:34px;font-weight:700;letter-spacing:0.08em;line-height:1.05;color:#ffffff;">DEBT<br>NOTE</div>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-size:20px;line-height:1.35;color:#ffffff;">${headline}</p>
          ${parts.bodyHtml}
          ${details}
          ${cta}
        </td></tr>
        <tr><td style="padding:16px 28px 28px;border-top:1px solid #222;font-size:11px;color:#555;">${footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textLines = [
    "DEBT NOTE",
    "",
    parts.headline,
    "",
    ...parts.bodyText,
  ];
  if (parts.detailRows?.length) {
    textLines.push("");
    for (const row of parts.detailRows) {
      textLines.push(`${row.label}: ${row.value}`);
    }
  }
  if (parts.actionUrl && parts.actionLabel) {
    textLines.push("", `${parts.actionLabel}: ${parts.actionUrl}`);
  }
  textLines.push("", footer);

  return { html, text: textLines.join("\n") };
}

export function p(text: string, muted = false): string {
  const color = muted ? "#aaaaaa" : "#e8e8e8";
  const size = muted ? "14px" : "16px";
  return `<p style="margin:0 0 14px;font-size:${size};line-height:1.65;color:${color};">${escapeHtml(text)}</p>`;
}
