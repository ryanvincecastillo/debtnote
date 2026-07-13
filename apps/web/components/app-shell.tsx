"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BellRing,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  NotebookPen,
  Plus,
  Settings,
  Users,
  Users2,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DNWordmark } from "@/components/ui/logo";
import { PLAN_LABEL } from "@/lib/constants";
import { ToastProvider } from "@/components/ui/toast";
import type { PlanTier } from "@/lib/types";

const SIDE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/records", label: "Records", icon: NotebookPen },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/reminders", label: "Reminders", icon: BellRing },
  { href: "/paluwagan", label: "Paluwagan", icon: Users2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/records", label: "Records", icon: NotebookPen },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/reminders", label: "Reminders", icon: BellRing },
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  useEffect(() => {
    if (!open && !fabOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setFabOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, fabOpen]);

  const nav = (
    <nav className="space-y-1">
      {SIDE_NAV.map((item) => {
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
    <ToastProvider>
      <div className="min-h-screen bg-black">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-surface/60 p-4 lg:flex">
          <Link href="/dashboard" className="mb-6 px-1 pt-1">
            <DNWordmark />
          </Link>
          <div className="flex-1">{nav}</div>
          {footer}
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-black/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Link href="/dashboard">
            <DNWordmark />
          </Link>
          <button
            type="button"
            aria-label="More"
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
          <div className="mx-auto max-w-6xl px-5 py-8 pb-28 sm:px-8 lg:pb-8">{children}</div>
        </main>

        {/* Mobile bottom tabs */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-black/90 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
            {BOTTOM_TABS.map((item) => {
              const active = isActive(pathname, item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium",
                    active ? "text-paper" : "text-muted",
                  )}
                >
                  <Icon size={18} className={active ? "text-blood" : undefined} />
                  {item.label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium text-muted"
            >
              <MoreHorizontal size={18} />
              More
            </button>
          </div>
        </nav>

        {/* FAB */}
        <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 lg:bottom-8 lg:right-8">
          {fabOpen ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setFabOpen(false);
                  router.push("/records/new");
                }}
                className="flex items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-paper shadow-lg"
              >
                <NotebookPen size={16} /> New record
              </button>
              <button
                type="button"
                onClick={() => {
                  setFabOpen(false);
                  router.push("/records?pay=1");
                }}
                className="flex items-center gap-2 rounded-full border border-border-strong bg-surface px-4 py-2.5 text-sm text-paper shadow-lg"
              >
                <Wallet size={16} /> Log payment
              </button>
            </>
          ) : null}
          <button
            type="button"
            aria-label={fabOpen ? "Close quick actions" : "Quick actions"}
            aria-expanded={fabOpen}
            onClick={() => setFabOpen((v) => !v)}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-blood text-paper shadow-lg glow-red-hover transition-transform",
              fabOpen && "rotate-45",
            )}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </ToastProvider>
  );
}
