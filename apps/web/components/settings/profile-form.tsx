"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { updateProfile } from "@/lib/actions/profile";
import { toneOptions } from "@/lib/tones";
import type { DebtNoteProfile, Tone } from "@/lib/types";

export function ProfileForm({ profile }: { profile: DebtNoteProfile }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  const [displayName, setDisplayName] = React.useState(profile.display_name ?? "");
  const [gcashNumber, setGcashNumber] = React.useState(profile.gcash_number ?? "");
  const [mayaNumber, setMayaNumber] = React.useState(profile.maya_number ?? "");
  const [defaultTone, setDefaultTone] = React.useState<Tone>(profile.default_tone);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    const res = await updateProfile({
      displayName,
      gcashNumber: gcashNumber || null,
      mayaNumber: mayaNumber || null,
      defaultTone,
    });

    setPending(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Display name" htmlFor="displayName" required hint="Ito ang pangalan na lalabas sa mga reminder.">
        <Input
          id="displayName"
          name="displayName"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setSaved(false);
          }}
          required
          placeholder="Juan Dela Cruz"
        />
      </Field>

      <Field label="GCash number" htmlFor="gcashNumber" hint="Ipapakita sa borrower kung saan magbabayad.">
        <Input
          id="gcashNumber"
          name="gcashNumber"
          value={gcashNumber}
          onChange={(e) => {
            setGcashNumber(e.target.value);
            setSaved(false);
          }}
          inputMode="tel"
          placeholder="0917 123 4567"
        />
      </Field>

      <Field label="Maya number" htmlFor="mayaNumber">
        <Input
          id="mayaNumber"
          name="mayaNumber"
          value={mayaNumber}
          onChange={(e) => {
            setMayaNumber(e.target.value);
            setSaved(false);
          }}
          inputMode="tel"
          placeholder="0917 123 4567"
        />
      </Field>

      <Field label="Default reminder tone" htmlFor="defaultTone" hint="Ang default na boses ng iyong mga paalala.">
        <Select
          id="defaultTone"
          name="defaultTone"
          value={defaultTone}
          onChange={(e) => {
            setDefaultTone(e.target.value as Tone);
            setSaved(false);
          }}
        >
          {toneOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </Select>
      </Field>

      {error ? <p className="text-sm text-blood">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" size="md" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {saved ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-receivable">
            <Check className="h-4 w-4" aria-hidden />
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
