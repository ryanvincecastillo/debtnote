# Debt Note App Auth Email (Resend + Send Email Hook)

Debt Note App uses a **Send Email Hook** so OTP emails are branded (black notebook "DEBT NOTE") instead of the shared Supabase/InaanApp template.

Because all side apps share one Supabase project, the hook routes by **current sign-in redirect URL first**, then `user_metadata.app`:

| App | From address | Email branding |
|-----|--------------|----------------|
| `debtnote` | `Debt Note App <noreply@ryanvincecastillo.com>` | Black notebook template |
| `inaanapp` | `InaanApp <noreply@ryanvincecastillo.com>` | Coral InaanApp template |

## Flutter

`signInWithOtp` must use an **allowlisted** redirect so the hook can route correctly:

```dart
data: {'app': 'debtnote', 'app_origin': 'debtnote'},
emailRedirectTo: 'debtnote://login-callback',
```

Supabase project redirect allow list must include:

- `debtnote://login-callback`
- `inaanapp://login-callback`
- `https://debtnote.app/auth/callback` (landing magic links)

## Edge function

`supabase/functions/auth-send-email`

Deploy:

```bash
cd supabase
supabase functions deploy auth-send-email --no-verify-jwt --project-ref xkoyoleurdafejlyxpxk
```

Secrets:

```bash
supabase secrets set DEBTNOTE_FROM_EMAIL="Debt Note App <noreply@ryanvincecastillo.com>" --project-ref xkoyoleurdafejlyxpxk
supabase secrets set INAANAPP_FROM_EMAIL="InaanApp <noreply@ryanvincecastillo.com>" --project-ref xkoyoleurdafejlyxpxk
```

## Test

1. Hot restart Debt Note App → sign in with your email
2. Email **From** should be `Debt Note App <noreply@ryanvincecastillo.com>`
3. Body should be black **DEBT NOTE** with monospace OTP
4. InaanApp sign-in should still receive the coral InaanApp template
