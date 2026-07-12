import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-blood text-paper hover:bg-blood-bright glow-red-hover",
  outline: "border border-border-strong text-foreground hover:border-blood hover:text-paper",
  ghost: "text-muted hover:text-paper hover:bg-elevated",
  danger: "border border-blood/40 text-blood hover:bg-blood/10",
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
