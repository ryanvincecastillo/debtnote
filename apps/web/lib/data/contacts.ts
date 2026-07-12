import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";

export async function listContacts(): Promise<Contact[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_note_contacts")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Contact[];
}

export async function getContact(id: string): Promise<Contact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_note_contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Contact) ?? null;
}

/** Contacts with a lightweight count of linked records (for the list view). */
export async function listContactsWithCounts(): Promise<(Contact & { record_count: number })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_note_contacts")
    .select("*, debt_note_records(count)")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((c: Record<string, unknown>) => {
    const rel = c.debt_note_records as { count: number }[] | undefined;
    return { ...(c as unknown as Contact), record_count: rel?.[0]?.count ?? 0 };
  });
}
