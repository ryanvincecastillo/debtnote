import Image from "next/image";
import { cn } from "@/lib/utils";

/** Notebook cover mark — transparent PNG with DEBT NOTE lettering. */
export function DNLogoMark({
  compact = false,
  className,
  priority,
}: {
  compact?: boolean;
  className?: string;
  priority?: boolean;
}) {
  // Source art is ~1149×1369 (portrait notebook).
  const width = compact ? 88 : 148;
  const height = compact ? 105 : 176;
  return (
    <Image
      src="/debtnote.png"
      alt="DebtNote"
      width={width}
      height={height}
      priority={priority}
      sizes={compact ? "88px" : "148px"}
      className={cn(
        "h-auto w-auto object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
        compact ? "max-h-[5.5rem]" : "max-h-40",
        className,
      )}
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
      DebtNote
    </span>
  );
}
