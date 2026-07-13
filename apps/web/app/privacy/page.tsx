import type { Metadata } from "next";
import Link from "next/link";
import { DNWordmark } from "@/components/ui/logo";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DebtNote collects, uses, and stores your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <DNWordmark className="text-lg" />
          </Link>
          <Link
            href="/login"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <p className="text-xs tracking-wider text-zinc-600 uppercase">Legal</p>
        <h1
          className="mt-2 text-4xl text-paper"
          style={{ fontFamily: "var(--font-crimson), serif" }}
        >
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">Last updated: July 13, 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-zinc-300">
          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              Who we are
            </h2>
            <p>
              DebtNote (“we”, “us”) is a personal collection notebook for local Filipino lenders.
              It is not a bank, microfinance institution, or lender. Contact:{" "}
              <a className="text-paper underline underline-offset-2" href="mailto:hello@debtnote.app">
                hello@debtnote.app
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              What we collect
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-zinc-400">
              <li>
                <span className="text-zinc-300">Account:</span> email address used for one-time
                password (OTP) sign-in.
              </li>
              <li>
                <span className="text-zinc-300">Profile:</span> display name, optional GCash/Maya
                numbers, default reminder tone, plan tier.
              </li>
              <li>
                <span className="text-zinc-300">Ledger data:</span> contacts (name, optional phone /
                email / notes), debt records, installments, payments, agreements, reminders, and
                payment-proof files you upload.
              </li>
              <li>
                <span className="text-zinc-300">Guest agreements:</span> borrower name, optional
                email, and signature image when someone signs via a shared link.
              </li>
              <li>
                <span className="text-zinc-300">Technical:</span> standard server logs and auth
                session cookies needed to keep you signed in.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              How we use data
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-zinc-400">
              <li>Provide the notebook, agreements, reminders, and lender alerts you request.</li>
              <li>Send OTP emails and scheduled debtor reminder / lender notification emails.</li>
              <li>Secure the service (abuse prevention, authentication).</li>
              <li>We do not sell personal data. We do not use ledger data for advertising.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              Processors
            </h2>
            <p>
              We use{" "}
              <a
                className="text-paper underline underline-offset-2"
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
              >
                Supabase
              </a>{" "}
              for authentication, database, and file storage, and{" "}
              <a
                className="text-paper underline underline-offset-2"
                href="https://resend.com"
                target="_blank"
                rel="noreferrer"
              >
                Resend
              </a>{" "}
              to deliver transactional email. Data may be processed in the regions those providers
              operate.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              Sharing links &amp; guest access
            </h2>
            <p>
              When you share an agreement link, anyone with that unguessable URL can view the
              agreement terms and submit a signature. Do not post private links publicly. Proof
              uploads are stored privately and are visible to your signed-in account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              Retention &amp; deletion
            </h2>
            <p>
              We keep your data while your account is active. You can permanently delete your
              DebtNote account in Settings → Danger zone (web or mobile). That erases your notebook
              data and proof files. If this login is only used for DebtNote, the Auth user is removed
              too; if you share the same login with our other apps, those apps keep the login but
              DebtNote data is gone. You may also email{" "}
              <a className="text-paper underline underline-offset-2" href="mailto:hello@debtnote.app">
                hello@debtnote.app
              </a>
              . Backups may take a short period to purge.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              Children
            </h2>
            <p>
              DebtNote is intended for adults managing personal lending relationships. It is not
              directed at children under 13.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg text-paper" style={{ fontFamily: "var(--font-crimson), serif" }}>
              Changes
            </h2>
            <p>
              We may update this policy as the product evolves. Material changes will be reflected
              on this page with a new “Last updated” date.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
