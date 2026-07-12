"use client";

import { motion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Scroll-triggered fade-up reveal (fires once). */
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/** Stagger container — plays children (use `rise` variant) on scroll into view. */
export function Stagger({
  children,
  className = "",
  animateOnMount = false,
}: {
  children: React.ReactNode;
  className?: string;
  animateOnMount?: boolean;
}) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      {...(animateOnMount
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, margin: "-80px" } })}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { motion };
