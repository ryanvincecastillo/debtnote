import Link from "next/link";
import {
  Wallet,
  HandCoins,
  FileText,
  AlertTriangle,
  Notebook,
  CalendarDays,
} from "lucide-react";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { Money, DirectionBadge } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/badge";
import { peso, formatDate } from "@/lib/format";
import { RECORD_STATUS_LABEL, INSTALLMENT_STATUS_LABEL } from "@/lib/constants";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/data-table";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Let the notebook do the talking."
        action={
          <Link href="/records/new" className={buttonClasses()}>
            New record
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total to collect"
          value={peso(summary.totalReceivable)}
          sub="Pautang — owed to you"
          tone="receivable"
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Total you owe"
          value={peso(summary.totalPayable)}
          sub="Utang — you owe"
          tone="payable"
          icon={<HandCoins size={18} />}
        />
        <Link href="/records?status=active" className="block transition-opacity hover:opacity-90">
          <StatCard
            label="Active records"
            value={summary.activeCount}
            sub="Open and ongoing"
            icon={<FileText size={18} />}
          />
        </Link>
        <Link href="/records?overdue=1" className="block transition-opacity hover:opacity-90">
          <StatCard
            label="Overdue installments"
            value={summary.overdueCount}
            sub="Tap to follow up"
            tone="danger"
            icon={<AlertTriangle size={18} />}
          />
        </Link>
      </div>

      {summary.dueThisWeek.length > 0 ? (
        <Card className="mt-8">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays size={16} className="text-muted" />
              Due this week
            </CardTitle>
            <Link href="/records?status=active" className="text-sm text-muted hover:text-paper">
              All active
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Due</TH>
                  <TH>Record</TH>
                  <TH>Contact</TH>
                  <TH className="text-right">Amount</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {summary.dueThisWeek.map((i) => (
                  <TR key={i.id}>
                    <TD className="text-muted">{formatDate(i.due_date)}</TD>
                    <TD>
                      <Link
                        href={`/records/${i.record.id}`}
                        className="font-medium text-paper hover:text-blood"
                      >
                        {i.record.title}
                      </Link>
                    </TD>
                    <TD className="text-muted">
                      {i.record.contact ? (
                        <Link
                          href={`/contacts/${i.record.contact.id}`}
                          className="hover:text-paper"
                        >
                          {i.record.contact.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TD>
                    <TD className="text-right">
                      <Money value={i.amount} direction={i.record.direction} />
                    </TD>
                    <TD>
                      <StatusBadge
                        status={i.status}
                        label={INSTALLMENT_STATUS_LABEL[i.status]}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-8">
        {summary.recent.length === 0 ? (
          <EmptyState
            icon={<Notebook size={40} strokeWidth={1.5} />}
            title="Wala pang records"
            description="Simulan mo na — magdagdag ng unang utang o pautang. Demo data is seeded for the owner account after first sign-in."
            action={
              <Link href="/records/new" className={buttonClasses()}>
                New record
              </Link>
            }
          />
        ) : (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent records</CardTitle>
              <Link
                href="/records"
                className="text-sm text-muted transition-colors hover:text-paper"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>Record</TH>
                    <TH>Type</TH>
                    <TH>Contact</TH>
                    <TH className="text-right">Balance</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {summary.recent.map((r) => (
                    <TR key={r.id}>
                      <TD>
                        <Link
                          href={`/records/${r.id}`}
                          className="font-medium text-paper transition-colors hover:text-blood"
                        >
                          {r.title}
                        </Link>
                      </TD>
                      <TD>
                        <DirectionBadge direction={r.direction} />
                      </TD>
                      <TD className="text-muted">
                        {r.contact ? (
                          <Link href={`/contacts/${r.contact.id}`} className="hover:text-paper">
                            {r.contact.name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TD>
                      <TD className="text-right">
                        <Money value={r.balance} direction={r.direction} />
                      </TD>
                      <TD>
                        <StatusBadge
                          status={r.status}
                          label={RECORD_STATUS_LABEL[r.status]}
                        />
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
