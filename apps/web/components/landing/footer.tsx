import Link from "next/link";
import { DNWordmark } from "@/components/ui/logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/login" },
      { label: "Home", href: "/home" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <DNWordmark className="text-xl" />
            <p
              className="mt-4 max-w-xs text-sm text-zinc-400"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Let the notebook do the talking.
            </p>
            <p className="mt-3 max-w-xs text-xs text-zinc-600">
              A collection notebook for local Filipino lenders. DebtNote is not
              a lender and does not charge interest.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs tracking-wider text-zinc-600 uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-zinc-400 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} DebtNote. Made para sa Pilipino.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <Link href="/privacy" className="transition-colors hover:text-zinc-400">
              Privacy
            </Link>
            <span>Peso-native · ₱ · Manila</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
