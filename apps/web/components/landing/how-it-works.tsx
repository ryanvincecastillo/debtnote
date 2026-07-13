import { NotebookPen, Send, BellRing } from "lucide-react";
import { Reveal } from "@/components/motion";

const STEPS = [
  {
    icon: NotebookPen,
    step: "01",
    title: "Add a record",
    body:
      "Isulat ang pangalan at halaga. Set a schedule — one-time, salary-period, or paluwagan — and DebtNote does the math.",
  },
  {
    icon: Send,
    step: "02",
    title: "Share & sign",
    body:
      "Send a public promissory link. Your borrower reviews the terms and signs from their phone — walang account, walang app to download.",
  },
  {
    icon: BellRing,
    step: "03",
    title: "Nudge until settled",
    body:
      "DebtNote emails polite reminders on schedule. Once proof of payment is uploaded, reminders freeze. Tapos — settled na.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-3xl text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Three steps to getting paid back
            </h2>
            <p className="mt-4 text-zinc-400">
              From awkward text thread to a clean, agreed record — in the time it
              takes to write a name.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden
            className="pointer-events-none absolute top-7 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent md:block"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={0.1 * i}>
              <div className="relative text-center md:text-left">
                <div className="relative z-10 mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-black md:mx-0">
                  <s.icon className="h-6 w-6 text-white" />
                </div>
                <div className="tnum mt-5 text-sm font-bold tracking-widest text-zinc-600">
                  {s.step}
                </div>
                <h3 className="mt-1 text-xl font-semibold text-white">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
