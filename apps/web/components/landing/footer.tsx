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
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <DNWordmark className="text-xl" />
            <p
              className="mt-4 max-w-xs text-sm text-muted"
              style={{ fontFamily: "var(--font-crimson), serif" }}
            >
              Let the notebook do the talking.
            </p>
            <p className="mt-3 max-w-xs text-xs text-faint">
              A personal utang &amp; pautang notebook for Filipinos. DebtNote is not
              a lender and does not charge interest.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs uppercase tracking-wider text-faint">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-paper"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-faint">
            © {new Date().getFullYear()} DebtNote. Made para sa Pilipino.
          </p>
          <p className="text-xs text-faint">Peso-native · ₱ · Manila</p>
        </div>
      </div>
    </footer>
  );
}
