import {
  BookOpenText,
  Bell,
  FileSignature,
  Lock,
  CalendarClock,
  EyeOff,
} from "lucide-react";
import { Reveal } from "@/components/motion";

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  tag?: string;
};

const FEATURES: Feature[] = [
  {
    icon: BookOpenText,
    title: "One dual ledger",
    body:
      "Track pautang (money owed to you) and utang (what you owe) in the same notebook — clear enough that you always know who owes who.",
  },
  {
    icon: Bell,
    title: "Automated email nudges",
    body:
      "Pick from four tones — from a warm Taglish reminder to the dramatic Shinigami Notice — and let DebtNote follow up so you don't have to.",
    tag: "4 tones",
  },
  {
    icon: FileSignature,
    title: "Signed promissory agreements",
    body:
      "Share a public link. Your borrower reviews the terms and signs — no app, no sign-up. You get a timestamped record that it was agreed.",
    tag: "No borrower account",
  },
  {
    icon: Lock,
    title: "Proof-upload freeze",
    body:
      "When a payment proof lands, reminders pause automatically — so no one gets nagged after they've already paid. Fair sa lahat.",
  },
  {
    icon: CalendarClock,
    title: "Salary-period & paluwagan",
    body:
      "Schedule installments around sahod (15th & 30th) or run a full paluwagan pool with payout order — DebtNote does the counting.",
  },
  {
    icon: EyeOff,
    title: "Private by default",
    body:
      "Your books are yours. Borrowers only ever see the single agreement you share with them — never your whole ledger.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Everything in one notebook
            </p>
            <h2
              className="mt-4 text-3xl text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Built for how Filipinos actually lend
            </h2>
            <p className="mt-4 max-w-lg text-zinc-400">
              Not a bank, not a loan app — just a sharper version of the notebook
              you already keep. Warm enough for barkada, firm enough to get paid.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={0.05 * i}>
              <div className="group">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/12 bg-white/[0.03]">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <div className="mt-5 flex flex-wrap items-baseline gap-2">
                  <h3 className="text-lg font-semibold text-white">{f.title}</h3>
                  {f.tag ? (
                    <span className="text-[11px] tracking-wide text-zinc-500 uppercase">
                      {f.tag}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
