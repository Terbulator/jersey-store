# Security

Non-negotiable rules for this codebase.

## Must do

1. Every API mutation requires an authenticated session.
2. Role checks on every protected route (middleware **and** server-side guard).
3. Ownership scoping: OWNER only sees their data, WORKER only their tasks.
4. Input validation with Zod at API trust boundaries (signup, checkout, create-order).
5. Server-side price validation on checkout — never trust client amounts.
6. Audit logging (`logAudit`) on all create/update/delete.
7. Rate limiting on public auth endpoints (`rateLimitError`).
8. No secrets in frontend code. Use `NEXT_PUBLIC_` only for public keys.
9. Generic error messages to users; detailed logs server-side only.

## Must not do

1. Don't trust frontend role checks alone.
2. Don't expose internal IDs unnecessarily.
3. Don't let OWNER access another owner's data.
4. Don't let WORKER access admin/owner functions.
5. Don't log passwords or tokens.
6. Don't allow unauthenticated access to mutation endpoints.

## Env vars

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase (public).
- Supabase service-role key used only in `src/lib/supabase/admin.ts` (server-only).
- `DATABASE_URL` — Prisma.
- `STRIPE_SECRET_KEY` — Stripe (server-only).
