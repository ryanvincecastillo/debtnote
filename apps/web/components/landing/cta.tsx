import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { DNLogoMark } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative border-t border-border py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface px-6 py-16 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 55% at 50% 0%, rgba(255,108,55,0.12), transparent 70%), radial-gradient(40% 40% at 50% 100%, rgba(250,250,250,0.03), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="mx-auto mb-6 flex justify-center opacity-90">
                <DNLogoMark compact />
              </div>
              <h2
                className="mx-auto max-w-xl text-3xl text-paper sm:text-4xl"
                style={{ fontFamily: "var(--font-crimson), serif" }}
              >
                Let the notebook do the talking.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted">
                Stop being the bad guy over money you were kind enough to lend. Start
                your ledger in under a minute.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/login" className={buttonClasses({ size: "lg" })}>
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className={buttonClasses({ variant: "outline", size: "lg" })}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
