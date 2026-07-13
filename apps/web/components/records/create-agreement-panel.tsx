"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createAgreement } from "@/lib/actions/agreements";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { CopyLinkButton } from "@/components/records/copy-link-button";

export function CreateAgreementPanel({
  recordId,
  defaultBorrowerName,
}: {
  recordId: string;
  defaultBorrowerName?: string;
}) {
  const router = useRouter();
  const [borrowerName, setBorrowerName] = React.useState(defaultBorrowerName ?? "");
  const [borrowerEmail, setBorrowerEmail] = React.useState("");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [token, setToken] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!borrowerName.trim()) {
      setError("Borrower name is required.");
      return;
    }
    setPending(true);
    const res = await createAgreement({
      recordId,
      borrowerName: borrowerName.trim(),
      borrowerEmail: borrowerEmail.trim() || null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setToken(res.data!.token);
    setBorrowerEmail("");
    setExpiresAt("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create agreement</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Borrower name" htmlFor="agr-name" required>
            <Input
              id="agr-name"
              placeholder="Full name"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              required
            />
          </Field>

          <Field label="Borrower email" htmlFor="agr-email" hint="Optional — for their copy.">
            <Input
              id="agr-email"
              type="email"
              placeholder="borrower@example.com"
              value={borrowerEmail}
              onChange={(e) => setBorrowerEmail(e.target.value)}
            />
          </Field>

          <Field label="Expires" htmlFor="agr-expiry" hint="Optional — link stops working after this.">
            <Input
              id="agr-expiry"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </Field>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-full">
            {pending ? "Creating…" : "Create agreement"}
          </Button>
        </form>

        {token ? (
          <div className="mt-4 rounded-xl border border-receivable/30 bg-receivable/5 p-3">
            <p className="mb-2 text-sm font-medium text-receivable">
              Agreement ready — share this link:
            </p>
            <CopyLinkButton token={token} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
