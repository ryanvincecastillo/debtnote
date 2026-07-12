import Link from "next/link";
import {
  Wallet,
  HandCoins,
  FileText,
  AlertTriangle,
  Notebook,
} from "lucide-react";
import { getDashboardSummary } from "@/lib/data/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { Money, DirectionBadge } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/badge";
import { peso } from "@/lib/format";
import { RECORD_STATUS_LABEL } from "@/lib/constants";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/data-table";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Let the notebook do the talking."
        action={
          <Link href="/app/records/new" className={buttonClasses()}>
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
        <StatCard
          label="Active records"
          value={summary.activeCount}
          sub="Open and ongoing"
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Overdue installments"
          value={summary.overdueCount}
          sub="Need following up"
          tone="danger"
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div className="mt-8">
        {summary.recent.length === 0 ? (
          <EmptyState
            icon={<Notebook size={40} strokeWidth={1.5} />}
            title="Wala pang records"
            description="Simulan mo na — magdagdag ng unang utang o pautang para masimulan ng notebook ang trabaho."
            action={
              <Link href="/app/records/new" className={buttonClasses()}>
                New record
              </Link>
            }
          />
        ) : (
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent records</CardTitle>
              <Link
                href="/app/records"
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
                          href={`/app/records/${r.id}`}
                          className="font-medium text-paper transition-colors hover:text-blood"
                        >
                          {r.title}
                        </Link>
                      </TD>
                      <TD>
                        <DirectionBadge direction={r.direction} />
                      </TD>
                      <TD className="text-muted">{r.contact?.name ?? "—"}</TD>
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
