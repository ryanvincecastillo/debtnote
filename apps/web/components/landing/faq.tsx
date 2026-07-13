"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { motion } from "@/components/motion";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Does the person who owes me need an account?",
    a: "Nope. You share a public link, they review the terms and sign from their phone — no sign-up, no app to install. Only you keep a DebtNote account.",
  },
  {
    q: "What happens after someone pays?",
    a: "They (or you) upload a proof of payment. As soon as proof lands, DebtNote freezes the reminders for that record — so nobody gets nagged after they've already settled.",
  },
  {
    q: "Is SMS available?",
    a: "Not yet. Email nudges are live and free today. SMS follow-ups are coming soon and will be pay-as-you-go — we'll let you know the moment they're ready.",
  },
  {
    q: "Are my records private?",
    a: "Yes. Your ledger is yours alone. A borrower only ever sees the single agreement you chose to share with them — never your other records or balances.",
  },
  {
    q: "Can it handle paluwagan and sahod schedules?",
    a: "Yes. Set installments around payday (15th & 30th) or run a full paluwagan pool with payout order, and DebtNote tracks who's next and what's due.",
  },
  {
    q: "Is DebtNote a lending company?",
    a: "No. DebtNote doesn't lend money or charge interest. It's a personal notebook that records agreements you already make and helps you follow up politely.",
  },
];

export function FAQ() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="faq" className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <h2
          className="text-center text-3xl text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-crimson), serif" }}
        >
          Mga tanong, sagot
        </h2>
        <p className="mt-4 text-center text-zinc-400">
          The honest answers to what people ask before they start.
        </p>

        <div className="mt-10 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <Plus
                    className={cn(
                      "h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300",
                      isOpen && "rotate-45",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
