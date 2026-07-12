import {
  BookOpenText,
  Bell,
  FileSignature,
  Lock,
  CalendarClock,
  EyeOff,
} from "lucide-react";
import { Reveal } from "@/components/motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  accent: string;
  iconBg: string;
  tag?: { label: string; intent: "success" | "warn" | "danger" | "info" };
};

const FEATURES: Feature[] = [
  {
    icon: BookOpenText,
    title: "One dual ledger",
    body:
      "Track pautang (money owed to you) and utang (what you owe) in the same notebook — color-coded so you always know who owes who.",
    accent: "text-receivable",
    iconBg: "bg-receivable/10",
  },
  {
    icon: Bell,
    title: "Automated email nudges",
    body:
      "Pick from four tones — from a warm Taglish reminder to the dramatic Shinigami Notice — and let DebtNote follow up so you don't have to.",
    accent: "text-blood",
    iconBg: "bg-blood/10",
    tag: { label: "4 tones", intent: "danger" },
  },
  {
    icon: FileSignature,
    title: "Signed promissory agreements",
    body:
      "Share a public link. Your borrower reviews the terms and signs — no app, no sign-up. You get a timestamped record that it was agreed.",
    accent: "text-paper",
    iconBg: "bg-elevated",
    tag: { label: "No borrower account", intent: "info" },
  },
  {
    icon: Lock,
    title: "Proof-upload freeze",
    body:
      "When a payment proof lands, reminders pause automatically — so no one gets nagged after they've already paid. Fair sa lahat.",
    accent: "text-receivable",
    iconBg: "bg-receivable/10",
  },
  {
    icon: CalendarClock,
    title: "Salary-period & paluwagan",
    body:
      "Schedule installments around sahod (15th & 30th) or run a full paluwagan pool with payout order — DebtNote does the counting.",
    accent: "text-payable",
    iconBg: "bg-payable/10",
  },
  {
    icon: EyeOff,
    title: "Private by default",
    body:
      "Your books are yours. Borrowers only ever see the single agreement you share with them — never your whole ledger.",
    accent: "text-paper",
    iconBg: "bg-elevated",
  },
];

export function Features() {
  return (
    <section id="features" className="relative border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <Badge intent="danger">Everything in one notebook</Badge>
            <h2
              className="mt-4 text-3xl text-paper sm:text-4xl"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Built for how Filipinos actually lend
            </h2>
            <p className="mt-4 text-muted">
              Not a bank, not a loan app — just a sharper version of the notebook
              you already keep. Warm enough for barkada, firm enough to get paid.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={0.05 * i}>
              <Card className="group h-full p-6 transition-colors hover:border-border-strong">
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.iconBg}`}
                >
                  <f.icon className={`h-5 w-5 ${f.accent}`} />
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-paper">{f.title}</h3>
                  {f.tag ? <Badge intent={f.tag.intent}>{f.tag.label}</Badge> : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
