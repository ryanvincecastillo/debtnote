"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { scheduleReminder } from "@/lib/actions/reminders";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { toneOptions, renderTonePreview, type ReminderTone } from "@/lib/tones";
import { peso, formatDate } from "@/lib/format";
import type { Tone } from "@/lib/types";

export function ScheduleReminderForm({
  recordId,
  defaultTone,
  borrowerName,
  amount,
  title,
  dueDate,
}: {
  recordId: string;
  defaultTone?: Tone;
  borrowerName: string;
  amount: number | string;
  title: string;
  dueDate: string | null;
}) {
  const router = useRouter();
  const [tone, setTone] = React.useState<ReminderTone>(defaultTone ?? "taglish_casual");
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const preview = renderTonePreview(tone, {
    borrower: borrowerName || "kaibigan",
    amount: peso(amount),
    title,
    dueDate: dueDate ? formatDate(dueDate) : "soon",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!scheduledAt) {
      setError("Choose when to send the reminder.");
      return;
    }
    setPending(true);
    const res = await scheduleReminder({
      recordId,
      tone,
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setScheduledAt("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a reminder</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Tone" htmlFor="reminder-tone">
            <Select
              id="reminder-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as ReminderTone)}
            >
              {toneOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="rounded-xl border border-border bg-elevated px-3.5 py-3">
            <p className="mb-1 text-xs uppercase tracking-wider text-faint">Preview</p>
            <p className="text-sm text-foreground">{preview}</p>
          </div>

          <Field label="Send at" htmlFor="reminder-at" required>
            <Input
              id="reminder-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </Field>

          {error ? <p className="text-sm text-danger">{error}</p> : null}

          <Button type="submit" variant="outline" size="sm" disabled={pending} className="w-full">
            {pending ? "Scheduling…" : "Schedule reminder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
