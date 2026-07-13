# Play Store Prep

## App identity

- **Name:** Debt Note App
- **Package:** `com.ryanvincecastillo.debtnote_mobile`
- **Category:** Finance
- **Short description:** Collection notebook for local lenders — agreements, nudges, WhatsApp share.

## Store listing copy (draft)

**Title:** Debt Note App — Collection Notebook

**Description:**
Debt Note App helps local Filipino lenders track money owed to them — without ruining relationships.

- Collection ledger: what’s owed to you
- Email reminders to debtors (when they have email)
- Share promissory note links via WhatsApp — borrowers sign without creating an account
- Show GCash/Maya on the agreement so non-techie debtors can pay
- Upload payment proof to pause reminders while you verify
- Lender alerts when someone signs or sends proof
- Paluwagan pool tracking for community savings

Free plan includes unlimited records and email reminders. SMS reminders coming soon.

## Assets checklist

- [x] App icon (1024×1024) — from `debtnote.png` via `flutter_launcher_icons`
- [x] Splash screen — black background + `debtnote.png` via `flutter_native_splash`
- [x] Feature graphic (1024×500) — [`apps/mobile/assets/store/feature-graphic.png`](../apps/mobile/assets/store/feature-graphic.png)
- [ ] 6–8 screenshots (dashboard, new record, tone picker, agreement link, paluwagan) — capture on device before submit
- [x] Privacy policy URL — https://debtnote.app/privacy

## Build commands

```bash
cd apps/mobile
flutter pub get
dart run flutter_launcher_icons
dart run flutter_native_splash:create
flutter build appbundle --release
```

## Pre-submission

1. Apply Supabase migrations on production project (`supabase db push`)
2. Fill `.env` with production Supabase keys + `APP_URL=https://debtnote.app`
3. Set Vercel env: `CRON_SECRET`, `DEBTNOTE_EDGE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
4. Test email OTP auth on physical device
5. Test agreement link flow end-to-end with web deployed
6. Configure Play Console data safety (Supabase auth email, optional phone in contacts)

## Data safety (draft answers)

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email | Yes | With Supabase / Resend | Account auth, reminders, lender alerts |
| Name | Yes (contacts / borrower) | In agreement emails you send | Ledger + agreements |
| Phone | Optional (contacts) | No third-party ads | Contact book only |
| Photos / files | Proof uploads | Stored in private Supabase bucket | Payment verification |
| Financial info | Amounts you enter | No | Personal ledger |
