import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DebtRecord, Reminder } from "@/lib/types";

export type ReminderWithRecord = Reminder & {
  record: Pick<DebtRecord, "id" | "title" | "direction"> | null;
};

/** All reminders for the current user, joined to their record. Soonest scheduled first. */
export async function listReminders(): Promise<ReminderWithRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_note_reminders")
    .select("*, record:debt_note_records(id, title, direction)")
    .order("scheduled_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as ReminderWithRecord[];
}
