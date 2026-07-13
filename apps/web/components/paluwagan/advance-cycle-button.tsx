"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { advanceCycle } from "@/lib/actions/paluwagan";
import { Button } from "@/components/ui/button";

export function AdvanceCycleButton({
  poolId,
  nextMemberName,
}: {
  poolId: string;
  nextMemberName?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAdvance() {
    setError(null);
    setPending(true);
    const res = await advanceCycle(poolId);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" size="sm" onClick={handleAdvance} disabled={pending}>
        {pending ? (
          "Advancing…"
        ) : (
          <>
            {nextMemberName ? `Pay ${nextMemberName} & advance` : "Advance cycle"}
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
