import { listContactsWithCounts } from "@/lib/data/contacts";
import { ContactsManager } from "@/components/contacts/contacts-manager";

export default async function ContactsPage() {
  const contacts = await listContactsWithCounts();
  return <ContactsManager initialContacts={contacts} />;
}
