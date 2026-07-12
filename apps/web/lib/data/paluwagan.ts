import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PaluwaganMember, PaluwaganPool } from "@/lib/types";

export type PoolWithMembers = PaluwaganPool & { members: PaluwaganMember[] };

export async function listPools(): Promise<PoolWithMembers[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_note_paluwagan_pools")
    .select("*, members:debt_note_paluwagan_members(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((p: Record<string, unknown>) => {
    const pool = p as unknown as PoolWithMembers;
    pool.members = [...(pool.members ?? [])].sort((a, b) => a.payout_order - b.payout_order);
    return pool;
  });
}

export async function getPool(id: string): Promise<PoolWithMembers | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("debt_note_paluwagan_pools")
    .select("*, members:debt_note_paluwagan_members(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const pool = data as unknown as PoolWithMembers;
  pool.members = [...(pool.members ?? [])].sort((a, b) => a.payout_order - b.payout_order);
  return pool;
}
