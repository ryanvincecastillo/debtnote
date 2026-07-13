import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "inverse" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  /** Solid white CTA on dark surfaces */
  primary: "bg-white text-zinc-950 hover:bg-zinc-100",
  /** Alias kept for landing call sites */
  inverse: "bg-white text-zinc-950 hover:bg-zinc-100",
  outline:
    "border border-border-strong bg-transparent text-paper hover:border-paper/50 hover:bg-elevated",
  ghost: "text-muted hover:text-paper hover:bg-elevated",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

/** Class string for the button look — use on `<Link>` etc. */
export function buttonClasses(opts?: { variant?: Variant; size?: Size; className?: string }) {
  return cn(base, variants[opts?.variant ?? "primary"], sizes[opts?.size ?? "md"], opts?.className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => (
    <button ref={ref} className={buttonClasses({ variant, size, className })} {...props} />
  ),
);
Button.displayName = "Button";
