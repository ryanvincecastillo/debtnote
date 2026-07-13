"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

function NotebookVisual() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  // Pointer-driven 3D tilt.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 120,
    damping: 18,
  });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 120,
    damping: 18,
  });

  function handleMove(e: React.PointerEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className="relative mx-auto flex w-full max-w-md items-center justify-center"
      style={{ perspective: 1200 }}
    >
      {/* Soft accent halo */}
      <div
        aria-hidden
        className="absolute h-[85%] w-[85%] rounded-full bg-accent/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="absolute h-[60%] w-[60%] rounded-full bg-white/[0.04] blur-[80px]"
      />
      <motion.div
        className="relative"
        style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { y: [0, -14, 0] }}
        transition={
          reduce
            ? undefined
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <Image
          src="/debtnote.png"
          alt="The DebtNote notebook"
          width={420}
          height={500}
          priority
          className="h-auto w-full drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
          style={{ transform: "translateZ(40px)" }}
        />
      </motion.div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Cooler ambient wash — soft white + quiet orange */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 72% 18%, rgba(255,108,55,0.1), transparent 65%), radial-gradient(40% 35% at 20% 40%, rgba(250,250,250,0.04), transparent 60%)",
        }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3 py-1 text-xs tracking-wide text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Let the notebook do the talking.
          </span>

          <h1
            className="mt-6 text-4xl leading-[1.05] text-paper sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-crimson), serif" }}
          >
            Collect what you&apos;re owed{" "}
            <span className="text-accent">without the awkward</span> follow-up.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted lg:mx-0 sm:text-lg">
            Utang or pautang, DebtNote keeps the record and does the reminding for
            you. Write the name, share a signed agreement, and let the notebook
            send the nudges — para hindi ikaw ang masamang tao.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
            <Link href="/login" className={buttonClasses({ size: "lg", className: "w-full sm:w-auto" })}>
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className={buttonClasses({
                variant: "outline",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 lg:justify-start">
            <TrustItem value="4" label="reminder tones" />
            <span className="hidden h-8 w-px bg-border sm:block" />
            <TrustItem value="₱0" label="to start — email nudges free" />
            <span className="hidden h-8 w-px bg-border sm:block" />
            <div className="flex items-center gap-2 text-sm text-muted">
              <ShieldCheck className="h-4 w-4 text-receivable" />
              No account needed for borrowers
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          <NotebookVisual />
        </motion.div>
      </div>
    </section>
  );
}

function TrustItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center lg:text-left">
      <div className="tnum text-2xl font-bold text-paper">{value}</div>
      <div className="text-xs text-faint">{label}</div>
    </div>
  );
}
