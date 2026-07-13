import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContact } from "@/lib/data/contacts";
import { listRecords } from "@/lib/data/records";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money, DirectionBadge } from "@/components/ui/money";
import { StatusBadge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/data-table";
import { RECORD_STATUS_LABEL, SCHEDULE_LABEL } from "@/lib/constants";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  const all = await listRecords();
  const records = all.filter((r) => r.contact?.id === contact.id);

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-paper"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to contacts
        </Link>
      </div>

      <PageHeader title={contact.name} subtitle="Contact detail" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-faint">Phone</p>
              <p className="text-paper">{contact.phone || "—"}</p>
            </div>
            <div>
              <p className="text-faint">Email</p>
              <p className="text-paper">{contact.email || "—"}</p>
            </div>
            <div>
              <p className="text-faint">Notes</p>
              <p className="whitespace-pre-wrap text-paper">{contact.notes || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-faint">
            Linked records
          </h2>
          {records.length === 0 ? (
            <EmptyState
              title="No linked records"
              description="Create a record and attach this contact."
              action={
                <Link
                  href="/records/new"
                  className="text-sm font-medium text-blood hover:underline"
                >
                  New record
                </Link>
              }
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Title</TH>
                  <TH>Direction</TH>
                  <TH>Schedule</TH>
                  <TH className="text-right">Balance</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {records.map((r) => (
                  <TR key={r.id}>
                    <TD>
                      <Link
                        href={`/records/${r.id}`}
                        className="font-medium text-paper hover:text-blood"
                      >
                        {r.title}
                      </Link>
                    </TD>
                    <TD>
                      <DirectionBadge direction={r.direction} />
                    </TD>
                    <TD className="text-muted">{SCHEDULE_LABEL[r.schedule_type]}</TD>
                    <TD className="text-right">
                      <Money value={r.balance} direction={r.direction} />
                    </TD>
                    <TD>
                      <StatusBadge status={r.status} label={RECORD_STATUS_LABEL[r.status]} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
