# DebtNote

Personal utang/pautang collection for Filipinos — dual ledger, automated email nudges, signed promissory agreements (guest, no account), tone engine, proof-upload freeze, and paluwagan pools.

## Monorepo

```
debtnote/
├── apps/
│   ├── web/        # Next.js web app — landing (/) + authed dashboard (/app) + guest agreements (/a/[token])
│   └── mobile/     # Flutter mobile client
├── supabase/
│   ├── migrations/
│   └── functions/
└── docs/
```

## Quick start

### 1. Supabase

Apply migration on your shared Supabase project:

```bash
cd supabase
supabase db push
```

Or run [`supabase/migrations/20260709170000_debt_note_initial.sql`](supabase/migrations/20260709170000_debt_note_initial.sql) manually.

Seed tenant: `debtnote-dev` in `public.projects`.

### 2. Mobile (Flutter)

```bash
cd apps/mobile
cp .env.example .env
# Fill SUPABASE_URL, SUPABASE_ANON_KEY, APP_PROJECT_ID=debtnote-dev
flutter pub get
flutter run
```

### 3. Web app (Next.js)

```bash
cd apps/web
cp .env.example .env.local   # Supabase URL + anon key, service role key, project slug
npm install
npm run dev
```

Open http://localhost:3000 — marketing landing at `/`, sign in at `/login` (email OTP), the app at `/app` (dashboard, records, contacts, reminders, paluwagan, settings), and the public guest agreement route at `/a/[token]`.

## Environment

| Variable | App | Purpose |
|----------|-----|---------|
| `SUPABASE_URL` | mobile | Supabase project URL |
| `SUPABASE_ANON_KEY` | mobile | Anon key |
| `APP_PROJECT_ID` | mobile | Tenant slug (`debtnote-dev`) |
| `NEXT_PUBLIC_SUPABASE_URL` | web | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | Anon key (auth + guest RPCs) |
| `SUPABASE_SERVICE_ROLE_KEY` | web | Server-only; resolves the tenant project by slug |
| `NEXT_PUBLIC_APP_PROJECT_SLUG` | web | Tenant slug (`debtnote-dev`) |
| `NEXT_PUBLIC_APP_URL` | web | Base URL for shareable agreement links |
| `RESEND_API_KEY` | edge fn | Email reminders |

## Features (v1)

- Dual ledger (pautang / utang)
- Contacts, records, installments, payments
- Schedule types: one-time, daily, weekly, 15th/30th salary, paluwagan
- Email reminder queue with 4 tones (incl. Shinigami Notice)
- Public agreement links + signature canvas (no borrower account)
- Proof upload freezes pending reminders
- Paluwagan pool rotation

**Coming soon:** SMS reminders + paid checkout (UI scaffolded, honest "coming soon" labeling).

## Auth email (Resend)

DebtNote uses the **Send Email Hook** (`auth-send-email` edge function) for branded OTP emails. See [`docs/AUTH_EMAIL.md`](docs/AUTH_EMAIL.md).

Hook URL: `https://xkoyoleurdafejlyxpxk.supabase.co/functions/v1/auth-send-email`

## Deploy

- **Web:** Vercel — root `apps/web` (domain: `debtnote.app`)
- **Mobile:** Google Play / App Store (see [`docs/PLAY_STORE.md`](docs/PLAY_STORE.md))
- **Edge functions:** `supabase functions deploy debt-note-send-reminder`

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/SUPABASE.md`](docs/SUPABASE.md)

## License

Private — Ryan Vince Castillo
