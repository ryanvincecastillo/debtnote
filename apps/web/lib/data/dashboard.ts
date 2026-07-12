import "server-only";
import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/format";
import type { Contact, DebtRecord } from "@/lib/types";

export type DashboardSummary = {
  totalReceivable: number; // pautang — owed to you
  totalPayable: number; // utang — you owe
  activeCount: number;
  overdueCount: number;
  recent: (DebtRecord & { contact: Pick<Contact, "id" | "name"> | null })[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();

  const [{ data: active }, { count: overdueCount }, { data: recent }] = await Promise.all([
    supabase
      .from("debt_note_records")
      .select("direction, balance, status")
      .eq("status", "active"),
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
  ]);

  let totalReceivable = 0;
  let totalPayable = 0;
  for (const r of active ?? []) {
    const bal = toNumber((r as { balance: number | string }).balance);
    if ((r as { direction: string }).direction === "receivable") totalReceivable += bal;
    else totalPayable += bal;
  }

  return {
    totalReceivable,
    totalPayable,
    activeCount: (active ?? []).length,
    overdueCount: overdueCount ?? 0,
    recent: (recent ?? []) as unknown as DashboardSummary["recent"],
  };
}
