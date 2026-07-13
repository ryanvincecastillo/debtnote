import type {
  Direction,
  InstallmentStatus,
  PlanTier,
  PoolStatus,
  ProofStatus,
  RecordStatus,
  ReminderStatus,
  ScheduleType,
} from "@/lib/types";

export const DIRECTION_LABEL: Record<Direction, string> = {
  receivable: "Collect",
  payable: "Pay", // legacy DB value — not exposed in UI
};

export const DIRECTION_SHORT: Record<Direction, string> = {
  receivable: "Collect",
  payable: "Pay",
};

export const SCHEDULE_LABEL: Record<ScheduleType, string> = {
  one_time: "One-time settle",
  daily: "Daily",
  weekly: "Weekly",
  semi_monthly_15_30: "Semi-monthly (15th/30th)",
  paluwagan: "Paluwagan",
};

export const RECORD_STATUS_LABEL: Record<RecordStatus, string> = {
  active: "Active",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const INSTALLMENT_STATUS_LABEL: Record<InstallmentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

export const REMINDER_STATUS_LABEL: Record<ReminderStatus, string> = {
  pending: "Scheduled",
  sent: "Sent",
  frozen: "Frozen",
  cancelled: "Cancelled",
  failed: "Failed",
};

export const PROOF_STATUS_LABEL: Record<ProofStatus, string> = {
  pending: "Under review",
  verified: "Verified",
  rejected: "Rejected",
};

export const POOL_STATUS_LABEL: Record<PoolStatus, string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PLAN_LABEL: Record<PlanTier, string> = {
  free: "Free",
  paid: "Paid",
};

// Badge intent used by <StatusBadge> — maps a status string to a semantic color.
export type BadgeIntent = "neutral" | "success" | "warn" | "danger" | "info";

export const STATUS_INTENT: Record<string, BadgeIntent> = {
  // records
  active: "info",
  paid: "success",
  cancelled: "neutral",
  // installments
  pending: "warn",
  overdue: "danger",
  // reminders
  sent: "success",
  frozen: "info",
  failed: "danger",
  // proof
  verified: "success",
  rejected: "danger",
  // pools
  completed: "success",
};

export const SCHEDULE_OPTIONS = (Object.keys(SCHEDULE_LABEL) as ScheduleType[]).map((k) => ({
  value: k,
  label: SCHEDULE_LABEL[k],
}));

export const DIRECTION_OPTIONS = (
  (Object.keys(DIRECTION_LABEL) as Direction[]).filter((k) => k === "receivable")
).map((k) => ({
  value: k,
  label: DIRECTION_LABEL[k],
}));
