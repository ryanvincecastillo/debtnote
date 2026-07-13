// Domain types for the debt_note_* Supabase schema.
// (CHECK-constrained text columns modeled as string unions — no native pg enums.)

export type Direction = "receivable" | "payable"; // receivable = pautang (collect); payable = utang (pay)
export type ScheduleType = "one_time" | "daily" | "weekly" | "semi_monthly_15_30" | "paluwagan";
export type RecordStatus = "active" | "paid" | "cancelled";
export type InstallmentStatus = "pending" | "paid" | "overdue" | "cancelled";
export type ReminderChannel = "email" | "sms";
export type ReminderStatus = "pending" | "sent" | "frozen" | "cancelled" | "failed";
export type ProofStatus = "pending" | "verified" | "rejected";
export type PoolStatus = "active" | "completed" | "cancelled";
export type PlanTier = "free" | "paid";
export type Tone = "taglish_casual" | "corporate" | "assertive" | "shinigami";
export type MemberRole = "owner" | "admin" | "member";

export interface DebtNoteProfile {
  id: string; // = auth.users.id
  project_id: string;
  email: string;
  display_name: string;
  gcash_number: string | null;
  maya_number: string | null;
  default_tone: Tone;
  plan_tier: PlanTier;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  project_id: string;
  owner_user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtRecord {
  id: string;
  project_id: string;
  owner_user_id: string;
  contact_id: string | null;
  direction: Direction;
  title: string;
  principal: number;
  balance: number;
  schedule_type: ScheduleType;
  status: RecordStatus;
  notes: string | null;
  paluwagan_pool_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  project_id: string;
  owner_user_id: string;
  record_id: string;
  sequence_no: number;
  amount: number;
  due_date: string; // date
  status: InstallmentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  owner_user_id: string;
  record_id: string;
  installment_id: string | null;
  amount: number;
  paid_at: string;
  notes: string | null;
  created_at: string;
}

export interface Agreement {
  id: string;
  project_id: string;
  owner_user_id: string;
  record_id: string;
  public_token: string;
  borrower_name: string;
  borrower_email: string | null;
  terms_json: Record<string, unknown>;
  signature_data: string | null;
  signed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  project_id: string;
  owner_user_id: string;
  record_id: string;
  installment_id: string | null;
  channel: ReminderChannel;
  tone: Tone;
  scheduled_at: string;
  status: ReminderStatus;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ProofSubmission {
  id: string;
  project_id: string;
  owner_user_id: string;
  record_id: string;
  storage_path: string;
  status: ProofStatus;
  submitted_at: string;
  verified_at: string | null;
}

export interface PaluwaganPool {
  id: string;
  project_id: string;
  owner_user_id: string;
  name: string;
  contribution_amount: number;
  cycle_length: number;
  current_cycle: number;
  status: PoolStatus;
  created_at: string;
  updated_at: string;
}

export interface PaluwaganMember {
  id: string;
  project_id: string;
  owner_user_id: string;
  pool_id: string;
  contact_id: string | null;
  member_name: string;
  payout_order: number;
  has_received_payout: boolean;
  created_at: string;
}

// Guest agreement view returned by RPC debt_note_get_agreement_by_token
export interface AgreementByToken {
  id: string;
  borrower_name: string;
  borrower_email: string | null;
  terms_json: Record<string, unknown>;
  signature_data: string | null;
  signed_at: string | null;
  record_title: string;
  principal: number;
  balance: number;
  direction: Direction;
  gcash_number?: string | null;
  maya_number?: string | null;
  lender_name?: string | null;
}
