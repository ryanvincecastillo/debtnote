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
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

const EASE = [0.22, 1, 0.36, 1] as const;

function NotebookVisual() {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 18,
  });
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), {
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
      className="relative mx-auto flex w-full max-w-[34rem] items-center justify-center lg:mx-0 lg:max-w-none lg:justify-end"
      style={{ perspective: 1400 }}
    >
      {/* Soft white bloom — notebook is the light source */}
      <div
        aria-hidden
        className="absolute right-1/2 h-[90%] w-[90%] translate-x-1/2 rounded-full bg-white/[0.07] blur-[100px] lg:right-0 lg:translate-x-[10%]"
      />
      <motion.div
        className="relative w-full max-w-[28rem] lg:max-w-[32rem] xl:max-w-[36rem]"
        style={reduce ? undefined : { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        animate={reduce ? undefined : { y: [0, -12, 0] }}
        transition={
          reduce ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <Image
          src="/debtnote.png"
          alt="DebtNote notebook cover"
          width={720}
          height={860}
          priority
          className="h-auto w-full select-none drop-shadow-[0_40px_80px_rgba(0,0,0,0.55)]"
          style={{ transform: "translateZ(36px)" }}
        />
      </motion.div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative isolate min-h-[100dvh] overflow-hidden">
      {/* Full-bleed atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 50% at 78% 42%, rgba(255,255,255,0.08), transparent 62%), radial-gradient(40% 35% at 18% 70%, rgba(255,255,255,0.03), transparent 55%), linear-gradient(180deg, #09090b 0%, #050505 100%)",
        }}
      />
      {/* Fine grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center gap-12 px-5 pb-16 pt-28 sm:px-8 lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-8 lg:pb-20 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative z-10 max-w-xl text-center lg:text-left"
        >
          <p
            className="text-sm tracking-[0.18em] text-white/55 uppercase"
            style={{ fontFamily: "var(--font-crimson), serif" }}
          >
            DebtNote
          </p>

          <h1
            className="mt-5 text-[2.6rem] leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
            style={{ fontFamily: "var(--font-crimson), serif" }}
          >
            Collect what you&apos;re owed without the awkward follow-up.
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-zinc-400 lg:mx-0 sm:text-lg">
            Collect what’s owed — write the name, share a signed agreement, and let
            the notebook send the nudges. Para hindi ikaw ang masamang tao.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Link
              href="/login"
              className={buttonClasses({
                variant: "inverse",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className={buttonClasses({
                variant: "outline",
                size: "lg",
                className: "w-full border-white/25 text-white hover:border-white/50 hover:bg-white/5 sm:w-auto",
              })}
            >
              See how it works
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.08, ease: EASE }}
          className="relative lg:-mr-8 xl:-mr-16"
        >
          <NotebookVisual />
        </motion.div>
      </div>
    </section>
  );
}
