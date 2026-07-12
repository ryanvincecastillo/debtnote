import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  Agreement,
  Contact,
  DebtRecord,
  Direction,
  Installment,
  Payment,
  RecordStatus,
  Reminder,
} from "@/lib/types";

export type RecordWithContact = DebtRecord & {
  contact: Pick<Contact, "id" | "name"> | null;
};

export type RecordDetail = DebtRecord & {
  contact: Contact | null;
  installments: Installment[];
  payments: Payment[];
  reminders: Reminder[];
  agreements: Agreement[];
};

/** Records owned by the current user (RLS-scoped). Newest first. */
export async function listRecords(opts?: {
  direction?: Direction;
  status?: RecordStatus;
}): Promise<RecordWithContact[]> {
  const supabase = await createClient();
  let q = supabase
    .from("debt_note_records")
    .select("*, contact:debt_note_contacts(id, name)")
    .order("created_at", { ascending: false });
  if (opts?.direction) q = q.eq("direction", opts.direction);
  if (opts?.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as RecordWithContact[];
}

/** One record with all its children. Null if not found / not owned. */
export async function getRecord(id: string): Promise<RecordDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_note_records")
    .select(
      `*,
       contact:debt_note_contacts(*),
       installments:debt_note_installments(*),
       payments:debt_note_payments(*),
       reminders:debt_note_reminders(*),
       agreements:debt_note_agreements(*)`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const rec = data as unknown as RecordDetail;
  rec.installments = [...(rec.installments ?? [])].sort((a, b) => a.sequence_no - b.sequence_no);
  rec.payments = [...(rec.payments ?? [])].sort((a, b) => b.paid_at.localeCompare(a.paid_at));
  rec.reminders = [...(rec.reminders ?? [])].sort((a, b) =>
    b.scheduled_at.localeCompare(a.scheduled_at),
  );
  rec.agreements = [...(rec.agreements ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  );
  return rec;
}
