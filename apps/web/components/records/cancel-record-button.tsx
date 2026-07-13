"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { cancelRecord } from "@/lib/actions/records";
import { Button } from "@/components/ui/button";

export function CancelRecordButton({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onCancel() {
    setError(null);
    setPending(true);
    const res = await cancelRecord(recordId);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setConfirming(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {confirming ? (
        <div className="flex items-center gap-2">
          <Button type="button" variant="danger" size="sm" disabled={pending} onClick={onCancel}>
            {pending ? "Cancelling…" : "Yes, cancel record"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Keep it
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="danger"
          size="sm"
          className="w-full"
          onClick={() => setConfirming(true)}
        >
          <Ban className="h-4 w-4" />
          Cancel record
        </Button>
      )}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
