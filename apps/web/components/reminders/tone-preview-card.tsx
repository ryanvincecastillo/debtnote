"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, Select } from "@/components/ui/field";
import { toneOptions, renderTonePreview, type ReminderTone } from "@/lib/tones";

const SAMPLE = {
  borrower: "Juan",
  amount: "₱1,500.00",
  title: "Phone repair utang",
  dueDate: "15 Jul 2026",
};

export function TonePreviewCard() {
  const [tone, setTone] = React.useState<ReminderTone>(toneOptions[0].id);
  const active = toneOptions.find((t) => t.id === tone) ?? toneOptions[0];
  const body = renderTonePreview(tone, SAMPLE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tone preview</CardTitle>
        <p className="mt-1 text-sm text-muted">
          See how each voice reads before you schedule. Let the notebook do the talking.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Tone" htmlFor="tone-preview" hint={active.description}>
          <Select
            id="tone-preview"
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

        {/* Email-style preview */}
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 text-xs text-faint">
            <div className="flex flex-col">
              <span className="text-muted">
                <span className="text-faint">To:</span> {SAMPLE.borrower}
              </span>
              <span className="text-muted">
                <span className="text-faint">Subject:</span> Reminder — {SAMPLE.title}
              </span>
            </div>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-faint">
              Email
            </span>
          </div>
          <div className="notebook-line px-4 py-5">
            <p className="whitespace-pre-wrap leading-8 text-foreground">{body}</p>
            <p className="mt-6 leading-8 text-faint">— sent via DebtNote</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
