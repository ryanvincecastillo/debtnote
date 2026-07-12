"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "@/lib/actions/records";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { peso, formatDate } from "@/lib/format";
import { INSTALLMENT_STATUS_LABEL } from "@/lib/constants";
import type { Installment } from "@/lib/types";

export function RecordPaymentForm({
  recordId,
  installments,
}: {
  recordId: string;
  installments: Installment[];
}) {
  const router = useRouter();
  const [amount, setAmount] = React.useState("");
  const [installmentId, setInstallmentId] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const payable = installments.filter((i) => i.status === "pending" || i.status === "overdue");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = parseFloat(amount);
    if (!(amt > 0)) {
      setError("Payment must be greater than zero.");
      return;
    }
    setPending(true);
    const res = await recordPayment({
      recordId,
      amount: amt,
      installmentId: installmentId || null,
      notes: notes.trim() || null,
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setAmount("");
    setInstallmentId("");
    setNotes("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record a payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Amount" htmlFor="pay-amount" required>
            <Input
              id="pay-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>

          {payable.length > 0 ? (
            <Field
              label="Apply to installment"
              htmlFor="pay-installment"
              hint="Optional — leave blank to apply to the balance."
            >
              <Select
                id="pay-installment"
                value={installmentId}
                onChange={(e) => setInstallmentId(e.target.value)}
              >
                <option value="">— balance (no specific installment) —</option>
                {payable.map((i) => (
                  <option key={i.id} value={i.id}>
                    #{i.sequence_no} · {formatDate(i.due_date)} · {peso(i.amount)} ·{" "}
                    {INSTALLMENT_STATUS_LABEL[i.status]}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}

          <Field label="Notes" htmlFor="pay-notes" hint="Optional — reference, channel, etc.">
            <Textarea
              id="pay-notes"
              placeholder="e.g. GCash ref 1234…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          {error ? <p className="text-sm text-blood">{error}</p> : null}

          <Button type="submit" variant="primary" size="sm" disabled={pending} className="w-full">
            {pending ? "Saving…" : "Log payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
