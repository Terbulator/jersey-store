# Auth Flow

Auth uses **Supabase** with SSR cookie sessions (via `@supabase/ssr`). The project
previously used NextAuth; that is no longer the case.

## Sign in

`/auth/signin` calls `supabase.auth.signInWithPassword` client-side. Supabase sets the
session cookie, and the middleware/session helper reads it on subsequent requests.

## Session resolution (server)

`src/lib/session.ts`:

1. Create a Supabase server client from cookies.
2. `supabase.auth.getUser()` → email.
3. Look up `prisma.user` by email → attach `role`.

Returns `SessionUser { id, email, name, role }` or `null`.

## Route protection

- `src/middleware.ts` redirects unauthenticated users away from `/account`, `/owner`,
  `/worker`, `/admin`.
- API routes re-verify with role guards (`admin-guard.ts`, `owner-guard.ts`, `worker-guard.ts`).

## Role guards

| Guard | Allows |
|-------|--------|
| `getAdminUser()` | session + `role === ADMIN` |
| `getOwnerUser()` | session + owner's `Vendor` (returns `vendor`) |
| `getWorkerUser()` | session + worker profile |

Always use server-side guards in API routes; never rely on client-side checks alone.
