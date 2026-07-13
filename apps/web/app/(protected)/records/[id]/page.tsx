import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileSignature, Bell, ReceiptText } from "lucide-react";
import { getRecord } from "@/lib/data/records";
import { getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/card";
import { Money, DirectionBadge } from "@/components/ui/money";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/data-table";
import { buttonClasses } from "@/components/ui/button";
import {
  SCHEDULE_LABEL,
  RECORD_STATUS_LABEL,
  INSTALLMENT_STATUS_LABEL,
  REMINDER_STATUS_LABEL,
} from "@/lib/constants";
import { peso, formatDate, formatDateTime, isOverdue } from "@/lib/format";
import { RecordPaymentForm } from "@/components/records/record-payment-form";
import { ScheduleReminderForm } from "@/components/records/schedule-reminder-form";
import { CreateAgreementPanel } from "@/components/records/create-agreement-panel";
import { ProofUpload } from "@/components/records/proof-upload";
import { ProofReviewList } from "@/components/records/proof-review";
import { CancelRecordButton } from "@/components/records/cancel-record-button";
import { CopyLinkButton } from "@/components/records/copy-link-button";

export default async function RecordDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [k: string]: string | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const autoFocusPay = sp.pay === "1";
  const rec = await getRecord(id);
  if (!rec) notFound();

  const profile = await getProfile();

  const borrowerName = rec.contact?.name ?? "";
  const nextDue =
    rec.installments.find((i) => i.status === "pending" || i.status === "overdue")?.due_date ??
    rec.installments[0]?.due_date ??
    null;

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/records"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-paper"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to records
        </Link>
      </div>

      <PageHeader
        title={rec.title}
        subtitle={
          rec.contact ? (
            <>
              With{" "}
              <Link href={`/contacts/${rec.contact.id}`} className="text-paper hover:text-blood">
                {rec.contact.name}
              </Link>
            </>
          ) : (
            "No contact linked"
          )
        }
        action={
          <div className="flex items-center gap-2">
            <DirectionBadge direction={rec.direction} />
            <StatusBadge status={rec.status} label={RECORD_STATUS_LABEL[rec.status]} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Principal" value={peso(rec.principal)} />
            <StatCard
              label="Balance"
              value={<Money value={rec.balance} direction={rec.direction} />}
              tone={rec.direction === "receivable" ? "receivable" : "payable"}
            />
            <StatCard label="Schedule" value={SCHEDULE_LABEL[rec.schedule_type]} />
          </div>

          {rec.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-foreground">{rec.notes}</p>
              </CardContent>
            </Card>
          ) : null}

          {/* Installments */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
              Installments
            </h2>
            {rec.installments.length === 0 ? (
              <EmptyState title="No installments" />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>#</TH>
                    <TH>Due date</TH>
                    <TH className="text-right">Amount</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {rec.installments.map((i) => {
                    const overdue = i.status === "pending" && isOverdue(i.due_date);
                    const displayStatus = overdue ? "overdue" : i.status;
                    return (
                      <TR key={i.id}>
                        <TD className="tnum text-muted">{i.sequence_no}</TD>
                        <TD className="text-foreground">{formatDate(i.due_date)}</TD>
                        <TD className="text-right">
                          <span className="tnum">{peso(i.amount)}</span>
                        </TD>
                        <TD>
                          <StatusBadge
                            status={displayStatus}
                            label={INSTALLMENT_STATUS_LABEL[displayStatus]}
                          />
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </div>

          {/* Payments */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
              Payment history
            </h2>
            {rec.payments.length === 0 ? (
              <EmptyState
                title="No payments yet"
                description="Log a payment from the panel on the right."
                icon={<ReceiptText className="h-6 w-6" />}
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Date</TH>
                    <TH className="text-right">Amount</TH>
                    <TH>Notes</TH>
                  </TR>
                </THead>
                <TBody>
                  {rec.payments.map((p) => (
                    <TR key={p.id}>
                      <TD className="text-foreground">{formatDateTime(p.paid_at)}</TD>
                      <TD className="text-right">
                        <Money value={p.amount} direction={rec.direction} />
                      </TD>
                      <TD className="text-muted">{p.notes ?? "—"}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </div>

          {/* Reminders */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
              Reminders
            </h2>
            {rec.reminders.length === 0 ? (
              <EmptyState
                title="No reminders scheduled"
                description="Schedule a nudge in the borrower's tone from the panel on the right."
                icon={<Bell className="h-6 w-6" />}
              />
            ) : (
              <Card>
                <ul className="divide-y divide-border">
                  {rec.reminders.map((rm) => (
                    <li key={rm.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-sm text-paper">{formatDateTime(rm.scheduled_at)}</p>
                        <p className="text-xs capitalize text-muted">
                          {rm.tone.replace(/_/g, " ")} · {rm.channel}
                        </p>
                      </div>
                      <StatusBadge status={rm.status} label={REMINDER_STATUS_LABEL[rm.status]} />
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Agreements */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
              Agreements
            </h2>
            {rec.agreements.length === 0 ? (
              <EmptyState
                title="No agreements yet"
                description="Create a signable promissory note from the panel on the right."
                icon={<FileSignature className="h-6 w-6" />}
              />
            ) : (
              <Card>
                <ul className="divide-y divide-border">
                  {rec.agreements.map((ag) => (
                    <li key={ag.id} className="space-y-2 px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-paper">
                            {ag.borrower_name}
                          </p>
                          <p className="text-xs text-muted">
                            {ag.signed_at
                              ? `Signed ${formatDateTime(ag.signed_at)}`
                              : ag.expires_at
                                ? `Expires ${formatDate(ag.expires_at)}`
                                : "Awaiting signature"}
                          </p>
                        </div>
                        {ag.signed_at ? (
                          <Badge intent="success">Signed</Badge>
                        ) : (
                          <Badge intent="warn">Pending</Badge>
                        )}
                      </div>
                      <CopyLinkButton token={ag.public_token} />
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>

        {/* Side column — action panels */}
        <div className="space-y-6">
          {rec.status === "active" ? (
            <>
              <RecordPaymentForm
                recordId={rec.id}
                installments={rec.installments}
                autoFocusPay={autoFocusPay}
              />
              <ScheduleReminderForm
                recordId={rec.id}
                defaultTone={profile?.default_tone}
                borrowerName={borrowerName}
                amount={rec.balance}
                title={rec.title}
                dueDate={nextDue}
              />
              <CreateAgreementPanel recordId={rec.id} defaultBorrowerName={borrowerName} />
              <ProofUpload recordId={rec.id} />
              <ProofReviewList recordId={rec.id} proofs={rec.proofs ?? []} />

              <Card className="border-blood/30">
                <CardHeader className="border-blood/20">
                  <CardTitle className="text-blood">Danger zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-3 text-sm text-muted">
                    Cancelling marks this record as cancelled. Payment history is kept.
                  </p>
                  <CancelRecordButton recordId={rec.id} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent>
                <p className="text-sm text-muted">
                  This record is{" "}
                  <span className="font-medium text-paper">
                    {RECORD_STATUS_LABEL[rec.status].toLowerCase()}
                  </span>
                  . No further actions available.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
