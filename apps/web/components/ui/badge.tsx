import * as React from "react";
import { cn } from "@/lib/utils";
import { STATUS_INTENT, type BadgeIntent } from "@/lib/constants";

const intentClasses: Record<BadgeIntent, string> = {
  neutral: "bg-elevated text-muted border-border",
  success: "bg-receivable/10 text-receivable border-receivable/30",
  warn: "bg-payable/10 text-payable border-payable/30",
  danger: "bg-blood/10 text-blood border-blood/30",
  info: "bg-white/5 text-foreground border-border-strong",
};

export function Badge({
  intent = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { intent?: BadgeIntent }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        intentClasses[intent],
        className,
      )}
      {...props}
    />
  );
}

/** Maps a status string (record/installment/reminder/proof/pool) to its colored badge. */
export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const intent = STATUS_INTENT[status] ?? "neutral";
  return <Badge intent={intent}>{label ?? status}</Badge>;
}
