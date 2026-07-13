"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccount } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function DeleteAccountPanel() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);

  async function onDelete() {
    if (confirm !== "DELETE") return;
    setPending(true);
    const res = await deleteAccount();
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(
      res.data?.authDeleted
        ? "Account deleted."
        : "DebtNote data deleted. Your login may still work for other apps on this account.",
    );
    router.replace("/");
    router.refresh();
  }

  if (!open) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">
          Permanently erase your DebtNote notebook — contacts, records, agreements, reminders,
          proofs, and profile. This cannot be undone.
        </p>
        <Button type="button" variant="danger" size="sm" onClick={() => setOpen(true)}>
          Delete account…
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-danger/30 bg-danger/5 p-4">
      <p className="text-sm text-paper">
        Type <span className="font-mono text-danger">DELETE</span> to confirm. If this email is
        only used for DebtNote, your login is removed too. If you use the same login for other
        apps on our shared backend, those apps keep the login but DebtNote data is gone.
      </p>
      <Field label="Confirmation" htmlFor="delete-confirm">
        <Input
          id="delete-confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={pending || confirm !== "DELETE"}
          onClick={() => void onDelete()}
        >
          {pending ? "Deleting…" : "Delete forever"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={() => {
            setOpen(false);
            setConfirm("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
