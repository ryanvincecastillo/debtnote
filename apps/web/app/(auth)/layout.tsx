import Link from "next/link";
import { DNLogoMark } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      {/* Soft white + accent haze */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-accent/10 blur-[110px]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="DebtNote home">
            <DNLogoMark priority />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-surface/80 p-8 backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
