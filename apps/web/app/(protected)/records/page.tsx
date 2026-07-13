import Link from "next/link";
import { Plus } from "lucide-react";
import { listRecords } from "@/lib/data/records";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/data-table";
import { RecordsTable } from "@/components/records/records-table";
import { RecordsPayPicker } from "@/components/records/records-pay-picker";
import type { Direction, RecordStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const DIRECTION_FILTERS: { key: string; label: string; value?: Direction }[] = [
  { key: "all", label: "All" },
  { key: "receivable", label: "Pautang", value: "receivable" },
  { key: "payable", label: "Utang", value: "payable" },
];

const STATUS_FILTERS: { key: string; label: string; value?: RecordStatus }[] = [
  { key: "any", label: "Any status" },
  { key: "active", label: "Active", value: "active" },
  { key: "paid", label: "Paid", value: "paid" },
  { key: "cancelled", label: "Cancelled", value: "cancelled" },
];

function buildHref(opts: {
  direction?: Direction;
  status?: RecordStatus;
  overdue?: boolean;
}) {
  const sp = new URLSearchParams();
  if (opts.direction) sp.set("direction", opts.direction);
  if (opts.status) sp.set("status", opts.status);
  if (opts.overdue) sp.set("overdue", "1");
  const q = sp.toString();
  return q ? `/records?${q}` : "/records";
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ [k: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const direction =
    params.direction === "receivable" || params.direction === "payable"
      ? (params.direction as Direction)
      : undefined;
  const status =
    params.status === "active" || params.status === "paid" || params.status === "cancelled"
      ? (params.status as RecordStatus)
      : undefined;
  const overdueOnly = params.overdue === "1";
  const payOpen = params.pay === "1";

  const records = await listRecords({ direction, status, overdueOnly });
  const activeFilter = direction ?? "all";
  const statusFilter = status ?? "any";

  return (
    <div>
      <PageHeader
        title="Records"
        subtitle={
          overdueOnly
            ? "Records with overdue installments."
            : "Every pautang and utang — let the notebook do the talking."
        }
        action={
          <Link href="/records/new" className={buttonClasses({ variant: "primary", size: "md" })}>
            <Plus className="h-4 w-4" />
            New record
          </Link>
        }
      />

      <div className="mb-3 flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          {DIRECTION_FILTERS.map((f) => {
            const href = buildHref({ direction: f.value, status, overdue: overdueOnly });
            const active = activeFilter === f.key;
            return (
              <Link
                key={f.key}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-elevated text-paper" : "text-muted hover:text-paper",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
          {STATUS_FILTERS.map((f) => {
            const href = buildHref({ direction, status: f.value, overdue: overdueOnly });
            const active = statusFilter === f.key;
            return (
              <Link
                key={f.key}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-elevated text-paper" : "text-muted hover:text-paper",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <Link
          href={buildHref({ direction, status, overdue: !overdueOnly })}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-sm font-medium",
            overdueOnly
              ? "border-danger/40 bg-danger/10 text-danger"
              : "border-border text-muted hover:text-paper",
          )}
        >
          Overdue only
        </Link>
      </div>

      {records.length === 0 ? (
        <EmptyState
          title={overdueOnly ? "Walang overdue" : "Wala pang records"}
          description={
            overdueOnly
              ? "Nice — nothing past due right now."
              : "Start by logging your first pautang or utang. Once you do, the notebook keeps score for you."
          }
          action={
            overdueOnly ? (
              <Link href="/records" className={buttonClasses({ variant: "outline", size: "md" })}>
                Show all records
              </Link>
            ) : (
              <Link href="/records/new" className={buttonClasses({ variant: "primary", size: "md" })}>
                <Plus className="h-4 w-4" />
                New record
              </Link>
            )
          }
        />
      ) : (
        <RecordsTable records={records} />
      )}

      <RecordsPayPicker open={payOpen} records={records} />
    </div>
  );
}
