"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Money } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/data-table";
import { SCHEDULE_LABEL, RECORD_STATUS_LABEL } from "@/lib/constants";
import type { Direction, RecordStatus, ScheduleType } from "@/lib/types";

export type RecordsRow = {
  id: string;
  title: string;
  direction: Direction;
  schedule_type: ScheduleType;
  balance: number | string;
  status: RecordStatus;
  contact: { id: string; name: string } | null;
  has_overdue?: boolean;
};

export function RecordsTable({
  records,
  initialQuery = "",
}: {
  records: RecordsRow[];
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return records;
    return records.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        (r.contact?.name ?? "").toLowerCase().includes(needle),
    );
  }, [records, q]);

  return (
    <div>
      <div className="mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title or contact…"
          className="w-full max-w-md rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-paper outline-none placeholder:text-faint focus:border-accent"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
          No records match “{q}”.
        </p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Contact</TH>
              <TH>Schedule</TH>
              <TH className="text-right">Balance</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((r) => (
              <TR key={r.id} className="cursor-pointer">
                <TD className="font-medium text-paper">
                  <Link href={`/records/${r.id}`} className="block">
                    {r.title}
                    {r.has_overdue ? (
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-danger">
                        Overdue
                      </span>
                    ) : null}
                  </Link>
                </TD>
                <TD className="text-muted">
                  {r.contact ? (
                    <Link href={`/contacts/${r.contact.id}`} className="hover:text-paper">
                      {r.contact.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TD>
                <TD className="text-muted">{SCHEDULE_LABEL[r.schedule_type]}</TD>
                <TD className="text-right">
                  <Money value={r.balance} direction="receivable" />
                </TD>
                <TD>
                  <StatusBadge status={r.status} label={RECORD_STATUS_LABEL[r.status]} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
