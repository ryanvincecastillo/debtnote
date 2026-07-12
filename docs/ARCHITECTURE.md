# DebtNote Architecture

## Overview

DebtNote is a personal utang/pautang collector — not a microfinance lending platform. It targets Filipino lenders collecting from friends, family, and small community pools.

## Clients

| Client | Stack | Role |
|--------|-------|------|
| `apps/mobile` | Flutter + Supabase | Primary product |
| `apps/landing` | Next.js 16 + Tailwind + Framer Motion | Marketing, SEO, guest agreements |

## Data flow

```
Mobile app ──► Supabase Auth (email OTP)
            ──► debt_note_* tables (project_id scoped)
            ──► Storage (proof receipts)

Landing ──► Guest /a/[token] ──► RPC debt_note_get/sign_agreement_by_token

Edge functions ──► debt-note-process-reminder-queue (cron)
                ──► debt-note-send-reminder (Resend email)
```

## Tenancy

Shared Supabase project with other side apps (Yes Honey, InaanApp, Avocado Go):

- `public.projects` + `public.project_members`
- All DebtNote tables prefixed `debt_note_*`
- Client env: `APP_PROJECT_ID=debtnote-dev`

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

Death Note–inspired aesthetic (original branding):

- Near-black background, paper text, blood red accents
- Components: `DNCard`, `DNLedgerRow`, `DNToneChip`, `DNInstallmentTimeline`

## Security

- RLS: `is_project_member(project_id) AND owner_user_id = auth.uid()`
- Guest agreements: unguessable `public_token`, security-definer RPCs only
- Proof uploads: user-scoped storage paths `{user_id}/{record_id}/...`
