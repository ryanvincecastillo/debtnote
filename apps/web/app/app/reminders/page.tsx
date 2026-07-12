import Link from "next/link";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  EmptyState,
} from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/badge";
import { DirectionBadge } from "@/components/ui/money";
import { buttonClasses } from "@/components/ui/button";
import { listReminders } from "@/lib/data/reminders";
import { REMINDER_STATUS_LABEL } from "@/lib/constants";
import { toneOptions } from "@/lib/tones";
import { formatDateTime } from "@/lib/format";
import type { Tone } from "@/lib/types";
import { TonePreviewCard } from "@/components/reminders/tone-preview-card";
import { CancelReminderButton } from "@/components/reminders/cancel-reminder-button";

function toneLabel(tone: Tone): string {
  return toneOptions.find((t) => t.id === tone)?.label ?? tone;
}

export default async function RemindersPage() {
  const reminders = await listReminders();

  return (
    <div>
      <PageHeader
        title="Reminders"
        subtitle="Schedule warm nudges so the notebook follows up for you."
      />

      <div className="mb-8">
        <TonePreviewCard />
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-paper">Scheduled queue</h2>
          <p className="mt-0.5 text-sm text-muted">
            <span className="text-paper">Frozen</span> reminders were paused
            automatically after a payment proof was uploaded — nothing sends until
            you review it.
          </p>
        </div>
      </div>

      {reminders.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No reminders scheduled"
          description="Open any record's detail page to schedule a reminder in your chosen tone."
          action={
            <Link href="/app/records" className={buttonClasses({ variant: "primary" })}>
              Go to records
            </Link>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Record</TH>
              <TH>Direction</TH>
              <TH>Tone</TH>
              <TH>Scheduled</TH>
              <TH>Channel</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {reminders.map((r) => (
              <TR key={r.id}>
                <TD>
                  {r.record ? (
                    <Link
                      href={`/app/records/${r.record.id}`}
                      className="font-medium text-paper hover:text-blood"
                    >
                      {r.record.title}
                    </Link>
                  ) : (
                    <span className="text-faint">Record removed</span>
                  )}
                </TD>
                <TD>
                  {r.record ? <DirectionBadge direction={r.record.direction} /> : "—"}
                </TD>
                <TD className="text-muted">{toneLabel(r.tone)}</TD>
                <TD className="tnum text-muted">{formatDateTime(r.scheduled_at)}</TD>
                <TD className="capitalize text-muted">{r.channel}</TD>
                <TD>
                  <StatusBadge
                    status={r.status}
                    label={REMINDER_STATUS_LABEL[r.status]}
                  />
                </TD>
                <TD className="text-right">
                  {r.status === "pending" ? (
                    <CancelReminderButton id={r.id} />
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <p className="mt-4 text-xs text-faint">
        Email only for now — SMS reminders are coming soon.
      </p>
    </div>
  );
}
