# DebtNote Supabase

## Shared database model

DebtNote runs on the same Supabase project as other side apps. Tables use the `debt_note_*` prefix to avoid collisions.

### Tenant registry (shared)

- `public.projects` — slug `debtnote-dev`
- `public.project_members` — auto-inserted on first login via `debt_note_ensure_profile()`

### App tables

| Table | Purpose |
|-------|---------|
| `debt_note_profiles` | User settings, GCash/Maya, default tone, plan tier |
| `debt_note_contacts` | Borrower/lender contacts |
| `debt_note_records` | Collection entries (receivable; payable legacy hidden) |
| `debt_note_installments` | Generated schedule |
| `debt_note_payments` | Payment log |
| `debt_note_agreements` | Guest-accessible promissory notes |
| `debt_note_reminders` | Email/SMS queue |
| `debt_note_proof_submissions` | Receipt uploads (triggers freeze) |
| `debt_note_paluwagan_pools` | Community pools |
| `debt_note_paluwagan_members` | Pool rotation members |

### RPCs

- `debt_note_ensure_profile(p_project_id, p_display_name)`
- `debt_note_create_record_with_schedule(...)`
- `debt_note_record_payment(...)`
- `debt_note_submit_proof(...)` — freezes pending reminders
- `debt_note_get_agreement_by_token(p_token)` — anon
- `debt_note_sign_agreement(p_token, p_signature)` — anon
- `debt_note_delete_account(p_project_id)` — wipe caller’s DebtNote data + membership; returns `delete_auth` when no other `project_members` remain

### Storage

- Bucket: `debt-note-proofs` (private)
- Path: `{user_id}/{record_id}/{timestamp}_{filename}`
- Owners may select / insert / delete their own folder

### Edge functions

Require `Authorization: Bearer <service_role>` (or a valid user JWT for `proof_pending` ownership checks / account deletion). Gateway JWT verify stays off (`--no-verify-jwt`); auth is enforced in-function.

- `debt-note-send-reminder` — tone template → Resend (to **debtor**); service role only
- `debt-note-process-reminder-queue` — cron via Vercel `/api/cron/process-reminders`; resolves contact/agreement email; skips `frozen`
- `debt-note-notify-lender` — lender alerts: `agreement_signed` (service), `proof_pending` (service or owning user), `overdue_digest` (service / daily Vercel cron)
- `debt-note-delete-account` — authenticated wipe of proofs + RPC delete; deletes Auth user when `delete_auth` is true

Secrets: `RESEND_API_KEY`, `DEBTNOTE_FROM_EMAIL` (Debt Note App From — do **not** use shared `RESEND_FROM_EMAIL`), `DEBTNOTE_EDGE_SECRET` (shared with Next.js for privileged invokes).

### Legacy note

The old microfinance schema (`profiles`, `customers`, `loans`, etc.) may still exist on hosted Supabase from the previous DebtNote iteration. **Do not drop** until confirmed unused. New migrations only add `debt_note_*` tables.

### Migration file

[`supabase/migrations/20260709170000_debt_note_initial.sql`](../supabase/migrations/20260709170000_debt_note_initial.sql)

## Client env

```env
APP_PROJECT_ID=debtnote-dev
```

May be UUID or slug — mobile resolves slug via `AppProject` (same pattern as InaanApp).
