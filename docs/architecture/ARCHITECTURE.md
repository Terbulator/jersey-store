# Architecture

Jersey Store is a multi-vendor e-commerce marketplace built on Next.js 14 (App Router).

## High-level flow

```
Browser
  │  HTTPS
  ▼
Next.js Server
  ├─ Middleware ── auth gate (redirect to /auth/signin if no session)
  ├─ Server Components ── dashboards (admin / owner / worker)
  ├─ API Routes ── guarded by role-specific lib guards
  └─ lib layer ── rbac / guards / audit / rate-limit / prisma
        │
        ▼
PostgreSQL (Prisma)
```

## Auth

Supabase handles identity (SSR cookie sessions). `src/lib/session.ts` resolves the
current user and looks up the matching Prisma `User` to attach the role. Roles and
permissions are enforced in `src/lib/rbac.ts`.

See [AUTH_FLOW.md](AUTH_FLOW.md).

## Request authorization (API routes)

1. `src/middleware.ts` blocks unauthenticated page access at the edge.
2. Each API route calls a role guard (`admin-guard.ts`, `owner-guard.ts`, `worker-guard.ts`)
   which verifies the session **and** role (401/403).
3. OWNER routes scope all queries by `vendorId`; WORKER routes scope by assignment.
4. Every mutation logs to the `AuditLog` table via `src/lib/audit.ts`.

## State management

- Server Components render dashboards (data fetched directly in the server component).
- Zustand + localStorage for the public cart and wishlist (`src/store/*`).
