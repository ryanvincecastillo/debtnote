"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "@/lib/actions/records";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { peso, formatDate } from "@/lib/format";
import { INSTALLMENT_STATUS_LABEL } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";
import type { Installment } from "@/lib/types";

export function RecordPaymentForm({
  recordId,
  installments,
  autoFocusPay = false,
}: {
  recordId: string;
  installments: Installment[];
  autoFocusPay?: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const payable = installments.filter((i) => i.status === "pending" || i.status === "overdue");
  const nextDue =
    payable.find((i) => i.status === "overdue") ??
    [...payable].sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ??
    null;

  const [amount, setAmount] = React.useState(nextDue ? String(nextDue.amount) : "");
  const [installmentId, setInstallmentId] = React.useState(nextDue?.id ?? "");
  const [notes, setNotes] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const amountRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocusPay) amountRef.current?.focus();
  }, [autoFocusPay]);

  function applyNext() {
    if (!nextDue) return;
    setInstallmentId(nextDue.id);
    setAmount(String(nextDue.amount));
    amountRef.current?.focus();
  }

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
      toast.error(res.error);
      return;
    }
    setAmount(nextDue && nextDue.id !== installmentId ? String(nextDue.amount) : "");
    setInstallmentId("");
    setNotes("");
    toast.success("Payment logged");
    router.refresh();
  }

  return (
    <Card id="pay">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Record a payment</CardTitle>
        {nextDue ? (
          <Button type="button" size="sm" variant="outline" onClick={applyNext}>
            Pay next ({peso(nextDue.amount)})
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Amount" htmlFor="pay-amount" required>
            <Input
              ref={amountRef}
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
                onChange={(e) => {
                  const id = e.target.value;
                  setInstallmentId(id);
                  const match = payable.find((i) => i.id === id);
                  if (match) setAmount(String(match.amount));
                }}
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

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" variant="primary" size="sm" disabled={pending} className="w-full">
            {pending ? "Saving…" : "Log payment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
