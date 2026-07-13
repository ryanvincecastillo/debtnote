import "server-only";
import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/format";
import type { Contact, DebtRecord, Installment } from "@/lib/types";

export type DueInstallment = Installment & {
  record: Pick<DebtRecord, "id" | "title" | "direction" | "status"> & {
    contact: Pick<Contact, "id" | "name"> | null;
  };
};

export type DashboardSummary = {
  totalReceivable: number;
  totalPayable: number;
  activeCount: number;
  overdueCount: number;
  recent: (DebtRecord & { contact: Pick<Contact, "id" | "name"> | null })[];
  dueThisWeek: DueInstallment[];
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek() {
  const d = startOfToday();
  d.setDate(d.getDate() + 7);
  return d;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const from = startOfToday().toISOString().slice(0, 10);
  const to = endOfWeek().toISOString().slice(0, 10);

  const [{ data: active }, { count: overdueCount }, { data: recent }, { data: due }] =
    await Promise.all([
      supabase.from("debt_note_records").select("direction, balance, status").eq("status", "active"),
      supabase
        .from("debt_note_installments")
        .select("id", { count: "exact", head: true })
        .eq("status", "overdue"),
      supabase
        .from("debt_note_records")
        .select("*, contact:debt_note_contacts(id, name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("debt_note_installments")
        .select(
          "*, record:debt_note_records!inner(id, title, direction, status, contact:debt_note_contacts(id, name))",
        )
        .in("status", ["pending", "overdue"])
        .gte("due_date", from)
        .lte("due_date", to)
        .order("due_date", { ascending: true })
        .limit(12),
    ]);

  let totalReceivable = 0;
  let totalPayable = 0;
  for (const r of active ?? []) {
    const bal = toNumber((r as { balance: number | string }).balance);
    if ((r as { direction: string }).direction === "receivable") totalReceivable += bal;
    else totalPayable += bal;
  }

  const dueThisWeek = ((due ?? []) as unknown as DueInstallment[]).filter(
    (i) => i.record?.status === "active",
  ).slice(0, 8);

  return {
    totalReceivable,
    totalPayable,
    activeCount: (active ?? []).length,
    overdueCount: overdueCount ?? 0,
    recent: (recent ?? []) as unknown as DashboardSummary["recent"],
    dueThisWeek,
  };
}
