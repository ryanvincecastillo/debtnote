import { redirect } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABEL } from "@/lib/constants";
import { ProfileForm } from "@/components/settings/profile-form";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  return (
    <div className="space-y-8">
      <PageHeader title="Settings" subtitle="Ayusin ang profile at payment details mo — ito ang lalabas sa mga reminder." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <div>
                  <p className="text-xs uppercase tracking-wide text-faint">Email</p>
                  <p className="text-sm text-paper">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-faint">Plan</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-paper">{PLAN_LABEL[profile.plan_tier]}</span>
                    <Badge intent={profile.plan_tier === "paid" ? "success" : "neutral"}>
                      {PLAN_LABEL[profile.plan_tier]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">Free — email reminders. SMS coming soon.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upgrade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted">
                Mas maraming reminders, SMS, at team features — paparating na. Abangan mo.
              </p>
              <Button variant="outline" size="sm" disabled>
                Upgrade (coming soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
