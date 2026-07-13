import { redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  // Provisions membership + profile on first visit, then returns it.
  const profile = await getProfile();

  return (
    <AppShell
      profile={{
        display_name: profile?.display_name ?? "",
        email: profile?.email ?? user.email ?? "",
        plan_tier: profile?.plan_tier ?? "free",
      }}
    >
      {children}
    </AppShell>
  );
}
