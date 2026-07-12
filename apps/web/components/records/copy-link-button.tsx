"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Renders the share link + a copy-to-clipboard button. */
export function CopyLinkButton({ token, className }: { token: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const url = `${base}/a/${token}`;
  const display = base ? url : `/a/${token}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url || display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — no-op
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
    </div>
  );
}
