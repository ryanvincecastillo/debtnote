"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { reviewProof } from "@/lib/actions/proofs";
import { createClient } from "@/lib/supabase/client";
import { PROOF_BUCKET } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PROOF_STATUS_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useToast } from "@/components/ui/toast";
import type { ProofSubmission } from "@/lib/types";

function ProofPreview({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const lower = path.toLowerCase();
  const isImage = /\.(png|jpe?g|gif|webp|heic)$/.test(lower);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(PROOF_BUCKET)
        .createSignedUrl(path, 60 * 30);
      if (cancelled) return;
      if (error || !data?.signedUrl) {
        setFailed(true);
        return;
      }
      setUrl(data.signedUrl);
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (failed) {
    return <p className="mt-2 text-xs text-muted">Preview unavailable.</p>;
  }
  if (!url) {
    return <p className="mt-2 text-xs text-muted">Loading preview…</p>;
  }
  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt="Payment proof"
        className="mt-3 max-h-64 w-full rounded-lg border border-border object-contain bg-black/40"
      />
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-block text-xs text-paper underline underline-offset-2"
    >
      Open file
    </a>
  );
}

export function ProofReviewList({
  recordId,
  proofs,
}: {
  recordId: string;
  proofs: ProofSubmission[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (proofs.length === 0) return null;

  async function decide(proofId: string, decision: "verified" | "rejected") {
    setBusyId(proofId);
    const res = await reviewProof({ proofId, recordId, decision });
    setBusyId(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(decision === "verified" ? "Proof verified" : "Proof rejected");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof submissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {proofs.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-elevated/60 px-3 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-paper">{p.storage_path.split("/").pop()}</p>
                <p className="text-xs text-muted">{formatDateTime(p.submitted_at)}</p>
              </div>
              <StatusBadge status={p.status} label={PROOF_STATUS_LABEL[p.status]} />
            </div>
            <ProofPreview path={p.storage_path} />
            {p.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={busyId === p.id}
                  onClick={() => decide(p.id, "verified")}
                >
                  Verify
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={busyId === p.id}
                  onClick={() => decide(p.id, "rejected")}
                >
                  Reject
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
