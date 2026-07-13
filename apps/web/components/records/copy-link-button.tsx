"use client";

import * as React from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function agreementUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return base ? `${base}/a/${token}` : `/a/${token}`;
}

function whatsappHref(token: string, borrowerName?: string) {
  const url = agreementUrl(token);
  const name = borrowerName?.trim() || "kaibigan";
  const text = `Hi ${name}! Ito ang DebtNote agreement link para sa utang — paki-review at paki-sign: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Copy + WhatsApp share for agreement links (non-techie debtor path). */
export function ShareAgreementButtons({
  token,
  borrowerName,
  className,
}: {
  token: string;
  borrowerName?: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const url = agreementUrl(token);
  const display = process.env.NEXT_PUBLIC_APP_URL ? url : `/a/${token}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url.startsWith("http") ? url : `${window.location.origin}${display}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-xs text-foreground">
          {display}
        </code>
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </Button>
      </div>
      <a
        href={whatsappHref(token, borrowerName)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-strong px-3 py-2 text-sm font-semibold text-paper transition-colors hover:bg-elevated"
      >
        <MessageCircle className="h-4 w-4" />
        Share via WhatsApp
      </a>
    </div>
  );
}

/** @deprecated Prefer ShareAgreementButtons */
export function CopyLinkButton({ token, className }: { token: string; className?: string }) {
  return <ShareAgreementButtons token={token} className={className} />;
}
