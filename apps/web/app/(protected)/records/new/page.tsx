import { listContacts } from "@/lib/data/contacts";
import { PageHeader } from "@/components/ui/page-header";
import { NewRecordForm } from "@/components/records/new-record-form";

export default async function NewRecordPage() {
  const contacts = await listContacts();

  return (
    <div>
      <PageHeader
        title="New record"
        subtitle="Log a pautang (collect) or utang (pay). The notebook takes it from here."
      />
      <div className="max-w-2xl">
        <NewRecordForm contacts={contacts} />
      </div>
    </div>
  );
}
