import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { DNLogoMark } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative border-t border-border py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <Reveal>
          <div className="glow-red relative overflow-hidden rounded-3xl border border-blood/40 bg-surface px-6 py-14 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 0%, rgba(193,18,31,0.18), transparent 70%)",
              }}
            />
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
            <div className="mt-8 flex justify-center">
              <Link href="/login" className={buttonClasses({ size: "lg" })}>
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
