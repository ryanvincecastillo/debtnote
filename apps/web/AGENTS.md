# apps/web — DebtNote web app

Next.js 16 (App Router) + React 19 + Tailwind v4 (CSS-first, no config file) + `@supabase/ssr`.
The `/` route is the marketing landing; the authenticated app lives under the `(app)` route group; `/a/[token]` is the public agreement-signing page.

## This is NOT the Next.js you know

This version has breaking changes vs. training data. Before writing routing/params/cookies code, read the relevant guide in `node_modules/next/dist/docs/`. Known specifics already in use here:

- **Dynamic route `params` is a `Promise`** — `const { token } = await params;` (see `app/a/[token]/page.tsx`).
- **`cookies()` from `next/headers` is async** — always `await cookies()`.
- Path alias `@/*` maps to the **project root** (not `src/`).
- Tailwind v4: theme tokens live in `app/globals.css` via `@theme inline`; there is no `tailwind.config.js`.

## Backend

Supabase, schema `debt_note_*` (see `supabase/migrations/20260709170000_debt_note_initial.sql`). Two-level tenancy: `projects` (slug `debtnote-dev`) + `project_members`, then per-user `owner_user_id = auth.uid()` enforced by RLS. Auth is **email OTP**; call RPC `debt_note_ensure_profile(project_id, display_name)` on first login. Prefer the side-effecting RPCs for writes: `debt_note_create_record_with_schedule`, `debt_note_record_payment`, `debt_note_submit_proof`. Guest agreement RPCs (anon): `debt_note_get_agreement_by_token`, `debt_note_sign_agreement`.
