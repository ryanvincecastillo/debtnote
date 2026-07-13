import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion";
import { buttonClasses } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative border-t border-white/10 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-[#0c0c0e] px-6 py-16 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 60% at 50% 0%, rgba(255,255,255,0.08), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="mx-auto mb-8 flex justify-center">
                <Image
                  src="/debtnote.png"
                  alt=""
                  width={120}
                  height={144}
                  className="h-24 w-auto opacity-90"
                />
              </div>
              <h2
                className="mx-auto max-w-xl text-3xl text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-crimson), serif" }}
              >
                Let the notebook do the talking.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-zinc-400">
                Stop being the bad guy over money you were kind enough to lend.
                Start your ledger in under a minute.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className={buttonClasses({ variant: "inverse", size: "lg" })}
                >
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className={buttonClasses({
                    variant: "outline",
                    size: "lg",
                    className: "border-white/25 text-white hover:border-white/50 hover:bg-white/5",
                  })}
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
