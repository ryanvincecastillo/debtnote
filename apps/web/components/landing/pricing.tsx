import Link from "next/link";
import { Check, MessageSquareText } from "lucide-react";
import { Reveal } from "@/components/motion";
import { buttonClasses } from "@/components/ui/button";

const FREE_INCLUDES = [
  "Unlimited records — pautang & utang",
  "Automated email nudges (all 4 tones)",
  "Signed promissory agreements",
  "Proof-upload freeze",
  "Salary-period & paluwagan schedules",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              className="text-3xl text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Free to start. Honestly.
            </h2>
            <p className="mt-4 text-zinc-400">
              Email reminders are free while DebtNote is growing. SMS follow-ups are
              on the way — babayaran mo lang kapag kailangan mo.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-3xl gap-5 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/[0.03] p-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Email</span>
                <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-zinc-300 uppercase">
                  Free
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="tnum text-4xl font-bold text-white">₱0</span>
                <span className="text-sm text-zinc-500">/ forever, for now</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                Everything you need to keep the record and get paid back.
              </p>
              <ul className="mt-6 space-y-3">
                {FREE_INCLUDES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={buttonClasses({
                  variant: "inverse",
                  className: "mt-7 w-full",
                })}
              >
                Get started
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-transparent p-7">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">SMS nudges</span>
                <span className="rounded-full border border-white/15 px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                  Coming soon
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="tnum text-4xl font-bold text-zinc-500">₱—</span>
                <span className="text-sm text-zinc-600">/ pay as you go</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">
                For the reminders na hindi mababasa sa email. Priced per message,
                only when you send.
              </p>
              <div className="mt-6 flex-1 rounded-xl border border-dashed border-white/12 p-5">
                <div className="flex items-center gap-2 text-zinc-300">
                  <MessageSquareText className="h-4 w-4" />
                  <span className="text-sm font-medium">On the roadmap</span>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  We&apos;ll email you the moment SMS goes live. No auto-charges,
                  no surprises.
                </p>
              </div>
              <button
                type="button"
                disabled
                className={buttonClasses({
                  variant: "outline",
                  className:
                    "mt-7 w-full cursor-not-allowed border-white/15 text-zinc-500 opacity-60",
                })}
              >
                Coming soon
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
