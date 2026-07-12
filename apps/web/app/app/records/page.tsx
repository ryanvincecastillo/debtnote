import Link from "next/link";
import { Plus } from "lucide-react";
import { listRecords } from "@/lib/data/records";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Money, DirectionBadge } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/data-table";
import { SCHEDULE_LABEL, RECORD_STATUS_LABEL } from "@/lib/constants";
import type { Direction, RecordStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const DIRECTION_FILTERS: { key: string; label: string; value?: Direction }[] = [
  { key: "all", label: "All" },
  { key: "receivable", label: "Pautang", value: "receivable" },
  { key: "payable", label: "Utang", value: "payable" },
];

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

  const records = await listRecords({ direction, status });

  const activeFilter = direction ?? "all";

  return (
    <div>
      <PageHeader
        title="Records"
        subtitle="Every pautang and utang — let the notebook do the talking."
        action={
          <Link href="/app/records/new" className={buttonClasses({ variant: "primary", size: "md" })}>
            <Plus className="h-4 w-4" />
            New record
          </Link>
        }
      />

      <div className="mb-6 inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
        {DIRECTION_FILTERS.map((f) => {
          const href = f.value ? `/app/records?direction=${f.value}` : "/app/records";
          const active = activeFilter === f.key;
          return (
            <Link
              key={f.key}
              href={href}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-elevated text-paper"
                  : "text-muted hover:text-paper",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {records.length === 0 ? (
        <EmptyState
          title="Wala pang records"
          description="Start by logging your first pautang or utang. Once you do, the notebook keeps score for you."
          action={
            <Link href="/app/records/new" className={buttonClasses({ variant: "primary", size: "md" })}>
              <Plus className="h-4 w-4" />
              New record
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Direction</TH>
              <TH>Contact</TH>
              <TH>Schedule</TH>
              <TH className="text-right">Balance</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {records.map((r) => (
              <TR key={r.id} className="cursor-pointer">
                <TD className="font-medium text-paper">
                  <Link href={`/app/records/${r.id}`} className="block">
                    {r.title}
                  </Link>
                </TD>
                <TD>
                  <Link href={`/app/records/${r.id}`} className="block">
                    <DirectionBadge direction={r.direction} />
                  </Link>
                </TD>
                <TD className="text-muted">
                  <Link href={`/app/records/${r.id}`} className="block">
                    {r.contact?.name ?? "—"}
                  </Link>
                </TD>
                <TD className="text-muted">
                  <Link href={`/app/records/${r.id}`} className="block">
                    {SCHEDULE_LABEL[r.schedule_type]}
                  </Link>
                </TD>
                <TD className="text-right">
                  <Link href={`/app/records/${r.id}`} className="block">
                    <Money value={r.balance} direction={r.direction} />
                  </Link>
                </TD>
                <TD>
                  <Link href={`/app/records/${r.id}`} className="block">
                    <StatusBadge status={r.status} label={RECORD_STATUS_LABEL[r.status]} />
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
