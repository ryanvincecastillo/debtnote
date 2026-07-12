import type { Metadata } from "next";
import { Suspense } from "react";
import { OtpLoginForm } from "./otp-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <h1
        className="text-2xl font-bold text-paper"
        style={{ fontFamily: "var(--font-crimson), serif" }}
      >
        Sign in
      </h1>
      <p className="mt-1 text-sm text-muted">
        We&apos;ll email you a one-time code. No password to remember.
      </p>
      <div className="mt-6">
        <Suspense>
          <OtpLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
