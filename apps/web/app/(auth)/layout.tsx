import Link from "next/link";
import { DNLogoMark } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6">
      {/* atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blood/15 blur-[130px]"
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
