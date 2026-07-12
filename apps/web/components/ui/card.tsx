import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-border bg-surface", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border px-5 py-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-semibold text-paper", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

/** Dashboard stat tile. `tone` colors the value. */
export function StatCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: "default" | "receivable" | "payable" | "danger";
  icon?: React.ReactNode;
}) {
  const valueColor =
    tone === "receivable"
      ? "text-receivable"
      : tone === "payable"
        ? "text-payable"
        : tone === "danger"
          ? "text-blood"
          : "text-paper";
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs uppercase tracking-wider text-faint">{label}</p>
        {icon ? <span className="text-muted">{icon}</span> : null}
      </div>
      <p className={cn("mt-3 text-2xl font-bold tnum", valueColor)}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted">{sub}</p> : null}
    </Card>
  );
}
