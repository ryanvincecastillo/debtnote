import Image from "next/image";
import { cn } from "@/lib/utils";

/** The DebtNote app mark (tab/app icon art). */
export function DNLogoMark({
  compact = false,
  className,
  priority,
}: {
  compact?: boolean;
  className?: string;
  priority?: boolean;
}) {
  const width = compact ? 120 : 180;
  return (
    <Image
      src="/debtnote-app.png"
      alt="DebtNote"
      width={width}
      height={width}
      priority={priority}
      sizes={compact ? "120px" : "180px"}
      className={cn("h-auto w-auto object-contain", compact ? "max-h-11" : "max-h-16", className)}
      style={{ width, height: "auto" }}
    />
  );
}

/** Compact text lockup for tight nav spots. */
export function DNWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("text-lg font-bold tracking-tight text-paper", className)}
      style={{ fontFamily: "var(--font-crimson), serif" }}
    >
      Debt<span className="text-accent">Note</span>
    </span>
  );
}
