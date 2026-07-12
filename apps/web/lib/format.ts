import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

/** Format a peso amount. Accepts number or numeric string (Supabase numeric comes back as string). */
export function peso(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  return (
    "₱" +
    safe.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : parseISO(value);
  return isValid(d) ? d : null;
}

/** "12 Jul 2026" */
export function formatDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, "dd MMM yyyy") : "—";
}

/** "12 Jul 2026, 3:04 PM" */
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  return d ? format(d, "dd MMM yyyy, h:mm a") : "—";
}

/** "in 3 days" / "2 days ago" */
export function formatRelative(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return "—";
  const diff = d.getTime() - Date.now();
  const rel = formatDistanceToNowStrict(d, { addSuffix: true });
  return diff >= 0 ? rel.replace("in ", "in ") : rel;
}

export function isOverdue(dueDate: string | Date | null | undefined): boolean {
  const d = toDate(dueDate);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}
