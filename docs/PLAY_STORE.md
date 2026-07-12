# Play Store Prep

## App identity

- **Name:** Debt Note App
- **Package:** `com.ryanvincecastillo.debtnote_mobile`
- **Category:** Finance
- **Short description:** Collect utang without awkwardness — dual ledger, email nudges, signed agreements.

## Store listing copy (draft)

**Title:** Debt Note App — Utang & Pautang Tracker

**Description:**
Debt Note App helps Filipinos track money owed and money to collect — without ruining relationships.

- Dual ledger: pautang (collect) and utang (pay)
- Automated email reminders with customizable tones
- Share promissory note links — borrowers sign without creating an account
- Upload payment proof to pause reminders while you verify
- Paluwagan pool tracking for community savings

Free plan includes unlimited records and email reminders. SMS reminders coming soon.

## Assets checklist

- [x] App icon (1024×1024) — from `debtnote.png` via `flutter_launcher_icons`
- [x] Splash screen — black background + `debtnote.png` via `flutter_native_splash`
- [ ] Feature graphic (1024×500)
- [ ] 6–8 screenshots (dashboard, new record, tone picker, agreement link, paluwagan)
- [ ] Privacy policy URL (host on landing `/privacy`)

## Build commands

```bash
cd apps/mobile
flutter pub get
dart run flutter_launcher_icons
dart run flutter_native_splash:create
flutter build appbundle --release
```

## Pre-submission

1. Apply Supabase migration on production project
2. Fill `.env` with production Supabase keys
3. Test email OTP auth on physical device
4. Test agreement link flow end-to-end with landing deployed
5. Configure Play Console data safety (Supabase auth email, optional phone in contacts)
