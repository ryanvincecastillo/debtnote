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

## Web (`apps/web`)

OTP is code-based (no magic-link navigation). Pass the same allowlisted deep link
mobile uses so the hook always sees `debtnote` in `redirect_to` — even when
`NEXT_PUBLIC_APP_URL` is a Vercel hostname that is not on the Auth allow list:

```ts
emailRedirectTo: 'debtnote://login-callback',
data: { app: 'debtnote', app_origin: 'debtnote' },
```

Do **not** rely on `https://debtnote-app.vercel.app/...` for branding unless that
exact origin is in Supabase Auth → Redirect URLs. If GoTrue rejects the redirect,
it substitutes the shared project Site URL (often InaanApp) and the wrong
template is sent. For existing users, `data.app` is also **not** updated on
repeat OTP — `redirect_to` is the reliable signal.
Supabase project redirect allow list must include:

- `debtnote://login-callback`
- `inaanapp://login-callback`
- `https://debtnote-app.vercel.app/**`
- `https://debtnote.app/**` (custom domain / magic links)

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
