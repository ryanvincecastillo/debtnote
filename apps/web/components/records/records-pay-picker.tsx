"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { peso } from "@/lib/format";
import type { Direction, RecordStatus } from "@/lib/types";

export type PayPickerRecord = {
  id: string;
  title: string;
  direction: Direction;
  balance: number | string;
  status: RecordStatus;
  contact: { id: string; name: string } | null;
};

export function RecordsPayPicker({
  open,
  records,
}: {
  open: boolean;
  records: PayPickerRecord[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const active = records.filter((r) => r.status === "active" && Number(r.balance) > 0);
    if (!needle) return active;
    return active.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        (r.contact?.name ?? "").toLowerCase().includes(needle),
    );
  }, [records, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-paper">Log payment</h2>
          <button
            type="button"
            aria-label="Close"
            className="rounded-lg p-2 text-muted hover:text-paper"
            onClick={() => router.replace("/records")}
          >
            <X size={18} />
          </button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search record or contact…"
          className="mb-3 w-full rounded-xl border border-border bg-elevated px-3 py-2.5 text-sm text-paper outline-none placeholder:text-faint"
        />
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-2 py-6 text-center text-sm text-muted">No active balances.</li>
          ) : (
            filtered.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/records/${r.id}?pay=1`}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-elevated"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-paper">{r.title}</p>
                    <p className="truncate text-xs text-muted">
                      {r.contact?.name ?? "No contact"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-paper">{peso(r.balance)}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
        <Link
          href="/records"
          className={buttonClasses({ variant: "ghost", size: "sm", className: "mt-3 w-full" })}
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
