"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { motion } from "@/components/motion";
import { toneOptions, renderTonePreview, type ReminderTone } from "@/lib/tones";
import { cn } from "@/lib/utils";

const SAMPLE = {
  borrower: "Kuya Ramon",
  amount: "₱2,500",
  title: "Grocery pautang",
  dueDate: "July 30",
};

export function ToneShowcase() {
  const [tone, setTone] = React.useState<ReminderTone>("shinigami");
  const active = toneOptions.find((t) => t.id === tone);

  return (
    <section className="relative border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-blood/30 bg-blood/10 px-3 py-1 text-xs font-medium text-blood">
              Say it your way
            </span>
            <h2
              className="mt-4 text-3xl text-paper sm:text-4xl"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Four tones. Same goal.
            </h2>
            <p className="mt-4 text-muted">
              Pick the voice that fits the relationship — a light Taglish nudge for
              barkada, or the dramatic Shinigami Notice when the deadline has come
              and gone. Tap to preview the actual email.
            </p>

            <div className="mt-7 flex flex-col gap-2">
              {toneOptions.map((t) => {
                const selected = t.id === tone;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-left transition-all",
                      selected
                        ? "border-blood/50 bg-blood/10"
                        : "border-border bg-surface hover:border-border-strong",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors",
                          selected ? "bg-blood" : "bg-faint",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          selected ? "text-paper" : "text-foreground",
                        )}
                      >
                        {t.label}
                      </span>
                    </div>
                    <p className="mt-1 pl-4 text-xs text-muted">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email preview */}
          <div className="glow-red rounded-2xl border border-border-strong bg-surface p-1.5">
            <div className="rounded-xl bg-elevated">
              <div className="flex items-center gap-2 border-b border-border px-5 py-3">
                <Mail className="h-4 w-4 text-blood" />
                <span className="text-xs font-medium text-muted">
                  DebtNote reminder
                </span>
                <span className="ml-auto text-xs text-faint">to {SAMPLE.borrower}</span>
              </div>
              <div className="notebook-line px-6 py-7">
                <p className="text-xs uppercase tracking-wider text-faint">
                  Subject
                </p>
                <p className="mt-1 font-semibold text-paper">
                  Re: {SAMPLE.title} — {SAMPLE.amount}
                </p>

                <div className="mt-5 min-h-[132px]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={tone}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="text-[15px] leading-relaxed text-foreground"
                    >
                      {renderTonePreview(tone, SAMPLE)}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-faint">
                    {active?.label}
                  </span>
                  <span
                    className="text-sm font-bold text-blood"
                    style={{ fontFamily: "var(--font-crimson), serif" }}
                  >
                    DebtNote
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
