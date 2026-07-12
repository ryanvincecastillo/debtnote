"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createRecord } from "@/lib/actions/records";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import { SCHEDULE_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Contact, Direction, ScheduleType } from "@/lib/types";

const MULTI_INSTALLMENT: ScheduleType[] = [
  "daily",
  "weekly",
  "semi_monthly_15_30",
  "paluwagan",
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function NewRecordForm({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();

  const [direction, setDirection] = React.useState<Direction>("receivable");
  const [title, setTitle] = React.useState("");
  const [principal, setPrincipal] = React.useState("");
  const [scheduleType, setScheduleType] = React.useState<ScheduleType>("one_time");
  const [installmentCount, setInstallmentCount] = React.useState("1");
  const [startDate, setStartDate] = React.useState(todayStr());
  const [contactId, setContactId] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const showInstallments = MULTI_INSTALLMENT.includes(scheduleType);

  function onScheduleChange(next: ScheduleType) {
    setScheduleType(next);
    if (!MULTI_INSTALLMENT.includes(next)) setInstallmentCount("1");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const principalNum = parseFloat(principal);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!(principalNum > 0)) {
      setError("Amount must be greater than zero.");
      return;
    }

    const count = showInstallments ? Math.max(1, parseInt(installmentCount, 10) || 1) : 1;

    setPending(true);
    const res = await createRecord({
      direction,
      title: title.trim(),
      principal: principalNum,
      scheduleType,
      installmentCount: count,
      startDate: startDate || undefined,
      contactId: contactId || null,
      notes: notes.trim() || null,
    });

    if (!res.ok) {
      setPending(false);
      setError(res.error);
      return;
    }
    router.push(`/app/records/${res.data!.id}`);
  }

  const segments: { value: Direction; label: string; hint: string; activeCls: string }[] = [
    {
      value: "receivable",
      label: "Pautang",
      hint: "May utang sa iyo",
      activeCls: "bg-receivable/15 text-receivable border-receivable/40",
    },
    {
      value: "payable",
      label: "Utang",
      hint: "May babayaran ka",
      activeCls: "bg-payable/15 text-payable border-payable/40",
    },
  ];

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Direction" required>
            <div className="grid grid-cols-2 gap-3">
              {segments.map((s) => {
                const active = direction === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setDirection(s.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors",
                      active
                        ? s.activeCls
                        : "border-border-strong bg-elevated text-muted hover:text-paper",
                    )}
                  >
                    <span className="text-sm font-semibold">{s.label}</span>
                    <span className="text-xs opacity-80">{s.hint}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Title" htmlFor="title" required>
            <Input
              id="title"
              placeholder="e.g. Loan kay Kuya Jun"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </Field>

          <Field label="Principal amount" htmlFor="principal" hint="In Philippine peso (₱)." required>
            <Input
              id="principal"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Schedule" htmlFor="schedule" required>
              <Select
                id="schedule"
                value={scheduleType}
                onChange={(e) => onScheduleChange(e.target.value as ScheduleType)}
              >
                {SCHEDULE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>

            {showInstallments ? (
              <Field
                label="Number of installments"
                htmlFor="installments"
                hint="How many payments to split into."
              >
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  step="1"
                  value={installmentCount}
                  onChange={(e) => setInstallmentCount(e.target.value)}
                />
              </Field>
            ) : (
              <Field label="Installments" hint="One-time settle uses a single installment.">
                <Input value="1" readOnly disabled />
              </Field>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Start date" htmlFor="startDate">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Field>

            <Field label="Contact" htmlFor="contact" hint="Optional — link a person.">
              <Select
                id="contact"
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
              >
                <option value="">— none —</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Notes" htmlFor="notes" hint="Optional details, terms, or context.">
            <Textarea
              id="notes"
              placeholder="Anything to remember about this record…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          {error ? <p className="text-sm text-blood">{error}</p> : null}

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Saving…" : "Create record"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => router.push("/app/records")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
