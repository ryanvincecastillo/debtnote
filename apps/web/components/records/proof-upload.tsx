"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitProof } from "@/lib/actions/proofs";
import { PROOF_BUCKET } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export function ProofUpload({ recordId }: { recordId: string }) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        setPending(false);
        setError("Couldn't refresh your session — please sign in again.");
        return;
      }

      const storagePath = `${userId}/${recordId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from(PROOF_BUCKET)
        .upload(storagePath, file, { upsert: false });
      if (upErr) {
        setPending(false);
        setError(upErr.message);
        return;
      }

      const res = await submitProof({ recordId, storagePath });
      setPending(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      setNotice("Proof submitted — it's now under review.");
      router.refresh();
    } catch (err) {
      setPending(false);
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload proof of payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Receipt / screenshot"
            htmlFor="proof-file"
            hint="Image or PDF. Freezes pending reminders while under review."
          >
            <input
              ref={inputRef}
              id="proof-file"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-border-strong bg-elevated px-3.5 py-2.5 text-sm text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-paper hover:file:bg-accent-bright"
            />
          </Field>

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {notice ? <p className="text-sm text-receivable">{notice}</p> : null}

          <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-full">
            <UploadCloud className="h-4 w-4" />
            {pending ? "Uploading…" : "Submit proof"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
