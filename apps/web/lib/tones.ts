import type { Tone } from "@/lib/types";

export type ReminderTone = Tone;

export const toneOptions: { id: ReminderTone; label: string; description: string }[] = [
  {
    id: "taglish_casual",
    label: "Taglish (Casual Nudge)",
    description: "Best for close friends or relatives — light and warm.",
  },
  {
    id: "corporate",
    label: "Corporate Notice",
    description: "Strict English for formal obligations.",
  },
  {
    id: "assertive",
    label: "Assertive Collector",
    description: "Direct and firm when deadlines slip.",
  },
  {
    id: "shinigami",
    label: "Shinigami Notice",
    description: "Dramatic Taglish — DebtNote signature tone.",
  },
];

export function renderTonePreview(
  tone: ReminderTone,
  ctx: { borrower: string; amount: string; title: string; dueDate: string },
) {
  switch (tone) {
    case "corporate":
      return `Dear ${ctx.borrower}, this is a formal notice regarding your obligation of ${ctx.amount} for "${ctx.title}" due ${ctx.dueDate}. Please settle at your earliest convenience.`;
    case "assertive":
      return `${ctx.borrower}, your ${ctx.amount} payment for "${ctx.title}" was due ${ctx.dueDate}. Please pay today to avoid further follow-ups.`;
    case "shinigami":
      return `${ctx.borrower}... ang utang na ${ctx.amount} para sa "${ctx.title}" ay due na (${ctx.dueDate}). Huwag palampasin — ang notebook ay nakatutok.`;
    default:
      return `Hi ${ctx.borrower}! Friendly reminder from DebtNote: your payment of ${ctx.amount} for "${ctx.title}" is due on ${ctx.dueDate}. Salamat! 😊`;
  }
}
