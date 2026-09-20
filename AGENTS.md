# AGENTS.md — Jersey Store

Project overview and conventions for AI agents and developers working in this repo.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui tokens (`src/components/ui/*`) |
| Database | PostgreSQL via Prisma 5.18 |
| Auth | **Supabase** (SSR cookies, `@supabase/ssr`). NOT NextAuth. |
| Payments | Stripe (PaymentIntents) |
| Client state | Zustand (cart, wishlist — localStorage) |
| Forms/validation | React Hook Form + Zod |

> Note: older docs/plans reference NextAuth. The project has migrated to Supabase auth. Trust the code, not stale docs.

## Commands

```bash
npm run dev        # dev server
npm run build      # type-check + build
npm run lint       # ESLint
npm run db:push    # prisma db push (apply schema)
npm run db:seed    # tsx prisma/seed.ts
```

## Roles & Route Guarding

- Roles: `CUSTOMER`, `OWNER`, `WORKER`, `ADMIN` (see `prisma/schema.prisma`, `Role` enum).
- Permissions defined in `src/lib/rbac.ts` (`can(role, permission)`).
- Middleware (`src/middleware.ts`) blocks unauthenticated access to `/account`, `/owner`, `/worker`, `/admin`.
- Server-side guards in `src/lib/{admin,owner,worker}-guard.ts` each verify session **and** role, with ownership scoping for OWNER/WORKER. Always use these in API routes.

## Conventions

- **Server Components** for dashboards; `'use client'` only where interactivity is needed.
- **Server-side auth is mandatory** on every API mutation — never trust the client.
- **Audit mutations**: call `logAudit(...)` from `src/lib/audit.ts` on create/update/delete.
- **Ownership scoping**: OWNER queries filter by `vendorId`; WORKER queries filter by assigned tasks.
- **Validation**: use Zod schemas at API trust boundaries (signup, checkout, create-order).
- **Rate limiting**: use `rateLimitError()` from `src/lib/rate-limit.ts` on public auth endpoints.
- Reuse the existing shadcn components in `src/components/ui/*`; avoid adding new UI libraries.
- Path alias: `@/*` → `src/*`.

## Codebase layout

```
src/
├── app/            # routes + API routes (app router)
│   ├── admin/      # admin dashboard UI
│   ├── owner/      # owner dashboard UI
│   ├── worker/     # worker dashboard UI
│   └── api/admin|owner|worker/   # role-scoped API routes
├── components/
│   ├── admin/ owner/ worker/ nav components
│   └── ui/         # shadcn primitives
├── lib/            # rbac, session, api-guard, guards, audit, rate-limit, prisma, utils
└── middleware.ts   # auth gate
```
