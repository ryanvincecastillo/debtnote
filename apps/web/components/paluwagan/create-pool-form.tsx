"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, Users } from "lucide-react";
import { createPool } from "@/lib/actions/paluwagan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";

let memberKey = 0;
function newMember() {
  return { key: `m-${++memberKey}`, name: "" };
}

export function CreatePoolForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [contributionAmount, setContributionAmount] = React.useState("");
  const [cycleLength, setCycleLength] = React.useState("");
  const [members, setMembers] = React.useState(() => [newMember(), newMember()]);

  function reset() {
    setName("");
    setContributionAmount("");
    setCycleLength("");
    setMembers([newMember(), newMember()]);
    setError(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function updateMember(key: string, value: string) {
    setMembers((prev) => prev.map((m) => (m.key === key ? { ...m, name: value } : m)));
  }

  function addMember() {
    setMembers((prev) => [...prev, newMember()]);
  }

  function removeMember(key: string) {
    setMembers((prev) => (prev.length > 1 ? prev.filter((m) => m.key !== key) : prev));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const contribution = Number(contributionAmount);
    const cycles = Number(cycleLength);
    const cleanMembers = members
      .map((m) => ({ name: m.name.trim() }))
      .filter((m) => m.name.length > 0);

    if (!name.trim()) return setError("Pangalan ng pool is required.");
    if (!(contribution > 0)) return setError("Contribution must be greater than 0.");
    if (!(cycles > 0)) return setError("Cycle length must be greater than 0.");
    if (cleanMembers.length === 0) return setError("Add at least one member.");

    setPending(true);
    const res = await createPool({
      name: name.trim(),
      contributionAmount: contribution,
      cycleLength: cycles,
      members: cleanMembers,
    });
    setPending(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    close();
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        New pool
      </Button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onClick={close}
    >
      <Card
        className="my-auto w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            className="text-lg font-bold text-paper"
            style={{ fontFamily: "var(--font-crimson), serif" }}
          >
            New paluwagan pool
          </h2>
          <button
            type="button"
            onClick={close}
            className="text-muted transition-colors hover:text-paper"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Pool name" htmlFor="pool-name" required>
              <Input
                id="pool-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Barkada Paluwagan"
                autoFocus
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Contribution"
                htmlFor="pool-contribution"
                hint="₱ per member per cycle"
                required
              >
                <Input
                  id="pool-contribution"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="1000"
                />
              </Field>
              <Field
                label="Cycle length"
                htmlFor="pool-cycles"
                hint="number of cycles"
                required
              >
                <Input
                  id="pool-cycles"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  placeholder="10"
                />
              </Field>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-sm font-medium text-paper">
                  <Users className="h-4 w-4 text-muted" />
                  Members
                </label>
                <span className="text-xs text-faint">Payout order top to bottom</span>
              </div>
              <div className="space-y-2">
                {members.map((m, i) => (
                  <div key={m.key} className="flex items-center gap-2">
                    <span className="tnum w-6 shrink-0 text-center text-sm text-faint">
                      {i + 1}
                    </span>
                    <Input
                      value={m.name}
                      onChange={(e) => updateMember(m.key, e.target.value)}
                      placeholder={`Member ${i + 1} name`}
                    />
                    <button
                      type="button"
                      onClick={() => removeMember(m.key)}
                      disabled={members.length <= 1}
                      className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-elevated hover:text-accent disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted"
                      aria-label={`Remove member ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addMember}>
                <Plus className="h-4 w-4" />
                Add member
              </Button>
            </div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={close} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? "Creating…" : "Create pool"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
