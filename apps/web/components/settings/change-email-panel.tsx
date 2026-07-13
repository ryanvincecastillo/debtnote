"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

type Step = "idle" | "form" | "verify";

export function ChangeEmailPanel({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<Step>("idle");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const next = email.trim().toLowerCase();
    if (!next || next === currentEmail.toLowerCase()) {
      setError("Enter a different email address.");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const { error: updateErr } = await supabase.auth.updateUser(
      { email: next },
      { emailRedirectTo: "debtnote://login-callback" },
    );
    setPending(false);
    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    setStep("verify");
    toast.success("Code sent — check the new inbox (and current inbox if Secure Email Change is on).");
  }

  async function confirmChange(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createClient();
    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email_change",
    });
    if (verifyErr) {
      setPending(false);
      setError(verifyErr.message);
      return;
    }

    // Sync debt_note_profiles.email from auth.users.
    await fetch("/api/account/sync-profile", { method: "POST" });

    setPending(false);
    toast.success("Email updated.");
    setStep("idle");
    setEmail("");
    setCode("");
    router.refresh();
  }

  if (step === "idle") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">
          Login email: <span className="text-paper">{currentEmail}</span>
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => setStep("form")}>
          Change email
        </Button>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <form onSubmit={confirmChange} className="space-y-3">
        <p className="text-sm text-muted">
          Enter the 6-digit code sent to <span className="text-paper">{email.trim()}</span>.
          If Secure Email Change is enabled, you may also get a code on your current address —
          use the code from the <span className="text-paper">new</span> inbox first.
        </p>
        <Field label="Confirmation code" htmlFor="email-change-code" required>
          <Input
            id="email-change-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
            autoFocus
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Confirming…" : "Confirm new email"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              setStep("form");
              setCode("");
              setError(null);
            }}
          >
            Back
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={requestChange} className="space-y-3">
      <p className="text-sm text-muted">
        We’ll email a confirmation code to the new address. Until you confirm, you still sign in
        with <span className="text-paper">{currentEmail}</span>.
      </p>
      <Field label="New email" htmlFor="new-email" required>
        <Input
          id="new-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="new@email.com"
          required
          autoFocus
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Sending…" : "Send confirmation code"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => {
            setStep("idle");
            setEmail("");
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
