import { cn } from "@/lib/utils";
import { peso } from "@/lib/format";
import { DIRECTION_SHORT } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { Direction } from "@/lib/types";

export function Money({
  value,
  direction,
  className,
}: {
  value: number | string | null | undefined;
  /** Colors the amount: receivable = emerald, payable = amber. */
  direction?: Direction;
  className?: string;
}) {
  const color =
    direction === "receivable"
      ? "text-receivable"
      : direction === "payable"
        ? "text-payable"
        : "text-paper";
  return <span className={cn("tnum font-semibold", color, className)}>{peso(value)}</span>;
}

export function DirectionBadge({ direction }: { direction: Direction }) {
  return (
    <Badge intent={direction === "receivable" ? "success" : "warn"}>
      {DIRECTION_SHORT[direction]}
    </Badge>
  );
}
