"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

type Step = "email" | "code";

export function OtpLoginForm() {
  const params = useSearchParams();
  const rawNext = params.get("next") || "/dashboard";
  const next = rawNext.startsWith("/") ? rawNext : "/dashboard";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      // Shared Supabase project: Send Email Hook routes branding by redirect_to
      // first, then user_metadata.app. Default is InaanApp.
      //
      // Use the allowlisted debtnote:// callback (same as mobile) — not
      // NEXT_PUBLIC_APP_URL. OTP is code-based; we never navigate to this redirect.
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: "debtnote://login-callback",
          data: { app: "debtnote", app_origin: "debtnote" },
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setStep("code");
      setNotice(`We sent a 6-digit code to ${email.trim()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "email",
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Hard navigate so the next request always carries the new auth cookies.
      // Profile provisioning runs in the protected layout — don't block redirect.
      window.location.assign(next);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Verification failed.");
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={verify} className="space-y-4">
        {notice ? <p className="text-sm text-receivable">{notice}</p> : null}
        <Field label="Verification code" htmlFor="code" required>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
          />
        </Field>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Verifying…" : "Verify & continue"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
            setNotice(null);
          }}
          className="w-full text-center text-sm text-muted hover:text-paper"
        >
          Use a different email
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={sendCode} className="space-y-4">
      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </Field>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending…" : "Email me a code"}
      </Button>
    </form>
  );
}
