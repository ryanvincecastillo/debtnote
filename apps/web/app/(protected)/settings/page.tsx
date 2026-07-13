import { redirect } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABEL } from "@/lib/constants";
import { ProfileForm } from "@/components/settings/profile-form";
import { DeleteAccountPanel } from "@/components/settings/delete-account-panel";
import { ChangeEmailPanel } from "@/components/settings/change-email-panel";

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
                <div className="w-full space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-faint">Email</p>
                    <ChangeEmailPanel currentEmail={profile.email} />
                  </div>
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
                  <p className="text-xs text-muted">
                    Free — email reminders. SMS and paid upgrade stay deferred until the free email
                    loop is reliable in production.
                  </p>
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
                SMS reminders, paid checkout, and team features are deferred until email delivery
                (cron + Resend) is proven in production.
              </p>
              <Button variant="outline" size="sm" disabled>
                Upgrade (coming soon)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
            </CardHeader>
            <CardContent>
              <DeleteAccountPanel />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
