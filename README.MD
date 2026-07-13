# DebtNote

Collection notebook for **local Filipino lenders** — track money owed to you, share signed agreements (WhatsApp-friendly, no debtor account), email nudges when they have email, and lender alerts when someone signs or uploads proof.

## Monorepo

```
debtnote/
├── apps/
│   ├── web/        # Next.js web app — landing (/) + dashboard (/dashboard, /records, …) + guest (/a/[token])
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

Or run the SQL under [`supabase/migrations/`](supabase/migrations/) manually.

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

Open http://localhost:3000 — marketing landing at `/`, sign in at `/login` (email OTP), the app at `/dashboard`.

## Features (v1)

- Creditor-only collection ledger (money owed to you)
- Contacts, records, installments, payments
- Schedule types: one-time, daily, weekly, 15th/30th salary, paluwagan
- Debtor email nudges (4 tones) when contact/agreement has email
- WhatsApp / copy link for non-techie debtors (no account needed)
- Guest agreement + signature canvas; GCash/Maya shown when set
- Lender alerts: agreement signed, proof to review, overdue digest
- Proof upload freezes pending reminders
- Paluwagan pool rotation

**Coming soon (deferred until free email reminders + cron are solid):** SMS reminders + paid checkout.

## Deploy

- **Web:** Vercel — root `apps/web` (domain: `debtnote.app`)
- **Mobile:** Google Play / App Store (see [`docs/PLAY_STORE.md`](docs/PLAY_STORE.md))
- **Edge functions:**
  - `supabase functions deploy debt-note-send-reminder --no-verify-jwt`
  - `supabase functions deploy debt-note-process-reminder-queue --no-verify-jwt`
  - `supabase functions deploy debt-note-notify-lender --no-verify-jwt`
  - `supabase functions deploy debt-note-delete-account --no-verify-jwt`
- **Cron (Vercel):** [`apps/web/vercel.json`](apps/web/vercel.json) — every 5 min `/api/cron/process-reminders`, daily 01:00 UTC `/api/cron/overdue-digest`. Set `CRON_SECRET` and `DEBTNOTE_EDGE_SECRET` in Vercel env (match Supabase secrets for the edge secret).

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/SUPABASE.md`](docs/SUPABASE.md)

## License

Private — all rights reserved.
