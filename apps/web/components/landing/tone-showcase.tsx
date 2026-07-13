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
    <section className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
              Say it your way
            </p>
            <h2
              className="mt-4 text-3xl text-white sm:text-4xl"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Four tones. Same goal.
            </h2>
            <p className="mt-4 text-zinc-400">
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
                        ? "border-white/35 bg-white/[0.06]"
                        : "border-white/10 bg-transparent hover:border-white/20",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors",
                          selected ? "bg-white" : "bg-zinc-600",
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          selected ? "text-white" : "text-zinc-300",
                        )}
                      >
                        {t.label}
                      </span>
                    </div>
                    <p className="mt-1 pl-4 text-xs text-zinc-500">{t.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-[#0c0c0e] p-1.5">
            <div className="rounded-xl bg-black">
              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                <Mail className="h-4 w-4 text-white" />
                <span className="text-xs font-medium text-zinc-400">
                  DebtNote reminder
                </span>
                <span className="ml-auto text-xs text-zinc-600">to {SAMPLE.borrower}</span>
              </div>
              <div className="notebook-line px-6 py-7">
                <p className="text-xs tracking-wider text-zinc-600 uppercase">Subject</p>
                <p className="mt-1 font-semibold text-white">
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
                      className="text-[15px] leading-relaxed text-zinc-300"
                    >
                      {renderTonePreview(tone, SAMPLE)}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs text-zinc-600">{active?.label}</span>
                  <span
                    className="text-sm font-bold text-white"
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
