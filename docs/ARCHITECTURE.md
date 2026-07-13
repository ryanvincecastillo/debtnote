# DebtNote Architecture

## Overview

DebtNote is a personal collection notebook for local Filipino lenders — not a bank or microfinance platform. Creditor-only in v1: track money owed to you, share signed agreements, email nudges, and lender alerts.

## Clients

| Client | Stack | Role |
|--------|-------|------|
| `apps/web` | Next.js + Tailwind | Marketing (`/`), authenticated app (`/dashboard`, `/records`, …), guest agreements (`/a/[token]`), privacy (`/privacy`) |
| `apps/mobile` | Flutter + Supabase | Companion client for day-to-day logging on the go |

## Data flow

```
Web / Mobile ──► Supabase Auth (email OTP)
              ──► debt_note_* tables (project_id scoped)
              ──► Storage (proof receipts)

Guest ──► /a/[token] ──► RPC debt_note_get/sign_agreement_by_token
       ──► /api/notify-lender (signed window) ──► debt-note-notify-lender

Vercel Cron ──► /api/cron/process-reminders ──► debt-note-process-reminder-queue
            ──► /api/cron/overdue-digest   ──► debt-note-notify-lender
                                              ──► debt-note-send-reminder (Resend)
```

## Tenancy

Shared Supabase project with other side apps (Yes Honey, InaanApp, Avocado Go):

- `public.projects` + `public.project_members`
- All DebtNote tables prefixed `debt_note_*`
- Client env: `APP_PROJECT_ID=debtnote-dev` (or `NEXT_PUBLIC_APP_PROJECT_SLUG`)

## Mobile structure

```
lib/
├── app/           # theme, gate, navigation shell
├── core/          # models, repository, AppProject
├── features/      # auth, dashboard, contacts, records, reminders, paluwagan, settings
└── widgets/       # DN* design system
```

Single repository pattern (`debt_note_repository.dart`) — all queries filter by `project_id`.

## UI system

Black-and-white product surfaces (web + landing). Mobile keeps a Death Note–inspired dark notebook look:

- Near-black background, paper text, strong accent
- Components: `DNCard`, `DNLedgerRow`, `DNToneChip`, `DNInstallmentTimeline`

## Security

- RLS: `is_project_member(project_id) AND owner_user_id = auth.uid()`
- Guest agreements: unguessable `public_token`, security-definer RPCs only
- Proof uploads: user-scoped storage paths `{user_id}/{record_id}/...`
- Edge functions: `DEBTNOTE_EDGE_SECRET` or service role; user JWT allowed only for owning-record `proof_pending`
- Public `/api/notify-lender`: `agreement_signed` only, requires recent `signed_at`
- Vercel cron routes: `Authorization: Bearer <CRON_SECRET>`

## Deferred (after free email loop is solid)

- SMS reminders (`channel: 'sms'` already in schema)
- Paid checkout / `plan_tier` upgrade
- Team features
