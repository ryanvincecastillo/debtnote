"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Pencil, Trash2, Plus, X } from "lucide-react";
import type { Contact } from "@/lib/types";
import { createContact, updateContact, deleteContact } from "@/lib/actions/contacts";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD, EmptyState } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/toast";

type ContactWithCount = Contact & { record_count: number };

export function ContactsManager({ initialContacts }: { initialContacts: ContactWithCount[] }) {
  const router = useRouter();
  const toast = useToast();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ContactWithCount | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<ContactWithCount | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(contact: ContactWithCount) {
    setEditing(contact);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleDelete(contact: ContactWithCount) {
    setDeletingId(contact.id);
    const res = await deleteContact(contact.id);
    setDeletingId(null);
    setConfirmDelete(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(`Deleted ${contact.name}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle="Ang mga taong may utang o pinagkakautangan mo."
        action={
          <Button variant="primary" size="md" onClick={openAdd}>
            <Plus className="size-4" />
            Add contact
          </Button>
        }
      />

      {formOpen ? (
        <ContactForm
          key={editing?.id ?? "new"}
          contact={editing}
          onClose={closeForm}
          onSaved={() => {
            closeForm();
            toast.success(editing ? "Contact updated" : "Contact added");
            router.refresh();
          }}
        />
      ) : null}

      {confirmDelete ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-paper">Delete contact?</h2>
            <p className="mt-2 text-sm text-muted">
              Delete “{confirmDelete.name}”? This can&apos;t be undone.
              {confirmDelete.record_count > 0
                ? ` Linked to ${confirmDelete.record_count} record(s).`
                : ""}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="danger"
                size="sm"
                disabled={deletingId === confirmDelete.id}
                onClick={() => handleDelete(confirmDelete)}
              >
                {deletingId === confirmDelete.id ? "Deleting…" : "Delete"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {initialContacts.length === 0 ? (
        <EmptyState
          icon={<Users className="size-8" />}
          title="Wala pang contacts"
          description="Magdagdag ng contact para ma-link sa iyong mga records at reminders."
          action={
            <Button variant="primary" size="md" onClick={openAdd}>
              <Plus className="size-4" />
              Add contact
            </Button>
          }
        />
      ) : (
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Name</TH>
              <TH>Phone</TH>
              <TH>Email</TH>
              <TH>Linked records</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {initialContacts.map((contact) => (
              <TR key={contact.id}>
                <TD className="font-medium text-paper">
                  <Link href={`/contacts/${contact.id}`} className="hover:text-accent">
                    {contact.name}
                  </Link>
                </TD>
                <TD className="tnum text-muted">{contact.phone || "—"}</TD>
                <TD className="text-muted">{contact.email || "—"}</TD>
                <TD>
                  {contact.record_count > 0 ? (
                    <Badge intent="info">{contact.record_count}</Badge>
                  ) : (
                    <span className="text-faint">0</span>
                  )}
                </TD>
                <TD>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(contact)}
                      aria-label={`Edit ${contact.name}`}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDelete(contact)}
                      aria-label={`Delete ${contact.name}`}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}

function ContactForm({
  contact,
  onClose,
  onSaved,
}: {
  contact: ContactWithCount | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(contact);
  const [name, setName] = React.useState(contact?.name ?? "");
  const [phone, setPhone] = React.useState(contact?.phone ?? "");
  const [email, setEmail] = React.useState(contact?.email ?? "");
  const [notes, setNotes] = React.useState(contact?.notes ?? "");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Kailangan ng pangalan.");
      return;
    }

    const input = {
      name: trimmed,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    startTransition(async () => {
      const res = contact
        ? await updateContact(contact.id, input)
        : await createContact(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="mb-8 rounded-2xl border border-border-strong bg-surface p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-lg font-semibold text-paper"
            style={{ fontFamily: "var(--font-crimson), serif" }}
          >
            {isEdit ? "Edit contact" : "New contact"}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {isEdit
              ? "I-update ang detalye ng contact na ito."
              : "Idagdag sa iyong notebook ang bagong contact."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onClose}
          aria-label="Close form"
        >
          <X className="size-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name" htmlFor="contact-name" required>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan dela Cruz"
            autoFocus
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="contact-phone" hint="Optional">
            <Input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0917 123 4567"
            />
          </Field>
          <Field label="Email" htmlFor="contact-email" hint="Optional">
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@email.com"
            />
          </Field>
        </div>

        <Field label="Notes" htmlFor="contact-notes" hint="Optional">
          <Textarea
            id="contact-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Kaibigan mula college, madalas late magbayad…"
          />
        </Field>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex gap-3 pt-1">
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? "Saving…" : isEdit ? "Save changes" : "Add contact"}
          </Button>
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
