"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellRing,
  LayoutDashboard,
  Menu,
  NotebookPen,
  Settings,
  Users,
  Users2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DNWordmark } from "@/components/ui/logo";
import { PLAN_LABEL } from "@/lib/constants";
import type { PlanTier } from "@/lib/types";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/records", label: "Records", icon: NotebookPen },
  { href: "/app/contacts", label: "Contacts", icon: Users },
  { href: "/app/reminders", label: "Reminders", icon: BellRing },
  { href: "/app/paluwagan", label: "Paluwagan", icon: Users2 },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  profile,
  children,
}: {
  profile: { display_name: string; email: string; plan_tier: PlanTier };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-blood/12 text-paper"
                : "text-muted hover:bg-elevated hover:text-paper",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-border pt-4">
      <div className="mb-3 px-1">
        <p className="truncate text-sm font-medium text-paper">
          {profile.display_name || profile.email.split("@")[0]}
        </p>
        <p className="truncate text-xs text-faint">{profile.email}</p>
        <span className="mt-1 inline-block rounded-full bg-elevated px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
          {PLAN_LABEL[profile.plan_tier]} plan
        </span>
      </div>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="w-full rounded-xl border border-border-strong px-3 py-2 text-sm text-muted transition-colors hover:border-blood hover:text-blood"
        >
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface/60 p-4 lg:flex">
        <Link href="/app" className="mb-6 px-1 pt-1">
          <DNWordmark />
        </Link>
        <div className="flex-1">{nav}</div>
        {footer}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-black/85 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/app">
          <DNWordmark />
        </Link>
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-muted hover:text-paper"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-surface p-4">
            <div className="mb-6 flex items-center justify-between">
              <DNWordmark />
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted hover:text-paper"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1">{nav}</div>
            {footer}
          </div>
        </div>
      ) : null}

      {/* Main */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
