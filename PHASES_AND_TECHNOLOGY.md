# Phases & Technology Map

> A phase-by-phase breakdown of the Jersey Store implementation, each with a diagram,
> the technology used for every piece, and its current status. Couples with
> `IMPLEMENTATION_PLAN.md`, `PRODUCT_SPEC.md`, and `ADMIN_DASHBOARD_REFERENCE.md`.

**Legend**

| Mark | Meaning |
|------|---------|
| ✅ | Complete |
| 🟡 | Partial / diverged from original plan |
| 🔜 | Planned / not built |

---

## Stack Overview (Used Everywhere Below)

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui (Radix primitives) |
| Database | PostgreSQL (Supabase) via Prisma 5.18 |
| Auth | Supabase (SSR cookies, `@supabase/ssr`) |
| Payments | Stripe (PaymentIntents) |
| Client state | Zustand (cart, wishlist — localStorage) |
| Forms / validation | React Hook Form + Zod 3 |
| Animation | Framer Motion |
| 3D | Three.js + React Three Fiber |
| Icons | lucide-react |
| Notifications | sonner (toasts) |
| HTTP | Fetch API (native) |
| Hosting | Vercel (serverless) |

---

## Phase 1 — Schema + Foundation Fix ✅

**Goal:** Database supports the role model; broken/security issues fixed; hardcoded data removed.

### Diagram

```
Before                                After (Phase 1)
--------                              ---------------
Role {CUSTOMER, VENDOR, ADMIN}        Role {CUSTOMER, OWNER, WORKER, ADMIN}
Hardcoded 12-product array  ───────►  Prisma Product model (Postgres)
Sanity client (unused)  ───────────►  Deleted
NextAuth fallback secret  ──────────►  Supabase auth (real secret via env)
Public checkout/create-order  ──────►  Session-gated
Products from hardcoded  ───────────►  Products from DB (Prisma queries)
```

### Technology used

| Task | Tech |
|------|------|
| Schema (roles + Worker/Task/AuditLog/Notification/Setting) | Prisma + PostgreSQL |
| Seed (demo OWNER / WORKER / ADMIN) | `prisma/seed.ts` (tsx) + Supabase admin client |
| Delete hardcoded products / Sanity | removed files, replaced by `src/lib/products.ts` → Prisma |
| Auth secret | Supabase env vars |
| Checkout / create-order auth + price validation | Next.js API routes + `getSession()` + Zod |
| Product pages to DB | Server Components running Prisma queries |

---

## Phase 2 — Auth + RBAC ✅

**Goal:** Every protected route checks role; unauthorized access blocked at edge and API.

### Diagram

```
Browser request
      │
      ▼
━━━━━━━━━━━━━━━━━━━━━━━━━
      Middleware (edge)
   supabase.auth.getUser()
   /account /owner /worker /admin
   ── no session ──► redirect /auth/signin
━━━━━━━━━━━━━━━━━━━━━━━━━
      │ session OK
      ▼
┌──────────────────────────────┐
│  Server guard (per role)      │
│  admin-guard / owner-guard /  │
│  worker-guard                 │
│  session + role check ──► 401/403
└──────────────┬───────────────┘
               │ authorized
               ▼
        can(role, permission)  ← src/lib/rbac.ts permission map
```

### Technology used

| Task | Tech |
|------|------|
| RBAC helper | `src/lib/rbac.ts` (`can()` + permission map) |
| Session helper | `src/lib/session.ts` (Supabase SSR + Prisma role lookup) |
| API guard | `src/lib/api-guard.ts` (`requireAuth`) + role guards |
| Audit service | `src/lib/audit.ts` (`logAudit()` → AuditLog table) |
| Middleware | `src/middleware.ts` (Supabase SSR on edge) |
| Notifications helper | `src/lib/notifications.ts` (in-app) |

---

## Phase 3 — Admin Backend API ✅

**Goal:** All admin CRUD endpoints work with auth + audit logging.

### Diagram

```
 /api/admin/*
      │
      ▼
 getAdminUser() ── no session ──► 401
      │            wrong role ──► 403
      ▼
  Prisma query (scoped)
      │
      ▼
 logAudit(action, resource)      ← AuditLog table
      │
      ▼
   JSON response
```

### Technology used

| Endpoint area | Tech |
|---------------|------|
| `/stats` | Prisma aggregate counts + recent orders |
| `/users` (list + PATCH role) | Prisma + `users.update` permission |
| `/owners` (list + status) | Prisma Vendor + `owners.approve/suspend` |
| `/workers` (list) | Prisma Worker |
| `/products` + `[id]` (CRUD) | Prisma + `slugify` |
| `/orders` + `[id]` (status) | Prisma + `orders.update` |
| `/categories` + `[id]` (CRUD) | Prisma Category |
| `/audit` (query) | Prisma AuditLog |
| `/settings` (get/update) | Prisma Setting (key/value JSON) |
| All guards + auditing | `getAdminUser()` + `logAudit()` |

---

## Phase 4 — Admin Dashboard UI ✅

**Goal:** Functional admin panel with all management pages.

### Diagram

```
 /admin
  │  layout.tsx ── guard (ADMIN) ── sidebar + main
  ▼
 ├── page.tsx         Dashboard ── stat cards + recent orders
 ├── users/           table + role inline select + search
 ├── owners/          table + status inline select + filter
 ├── workers/         read-only table + search
 ├── products/        table + create/edit dialog + delete
 ├── orders/          table + status inline select + filters
 ├── categories/      table + add/edit dialog + delete
 ├── audit/           read-only log + search + paging
 └── settings/        5-field config form
```

See `ADMIN_DASHBOARD_REFERENCE.md` for the full per-page reference.

### Technology used

| Task | Tech |
|------|------|
| Layout + sidebar | React Server Component + Radix/lucide icons |
| Data tables | Plain HTML `<table>` + Tailwind (no table lib) |
| Dialogs | Radix Dialog (`@radix-ui/react-dialog`) |
| Selects / inputs / textarea | shadcn primitives |
| Toasts | sonner |
| Fetch | native `fetch()` to `/api/admin/*` |
| Styling / responsive | Tailwind (grid, breakpoints) |

---

## Phase 5 — Owner Backend + Dashboard ✅

**Goal:** Owner manages their store, workers, tasks.

### Diagram

```
 /owner/*
      │
      ▼
 getOwnerUser() ── session + OWNER role
      │  returns { user, vendor }
      ▼
 ┌─────────────────────────────┐
 │  Data scoping (ownership)    │
 │  products: WHERE vendorId    │
 │  workers:  WHERE ownerId     │
 │  orders:   only items of own │
 │            products          │
 └─────────────────────────────┘
      │
      ▼
 logAudit(...)  ─────► JSON
```

### Technology used

| Task | Tech |
|------|------|
| Owner scoped stats / products / orders / workers / tasks | Prisma with `vendorId`/`ownerId` filters |
| Owner CRUD APIs | `getOwnerUser()` guard + `logAudit()` |
| Owner dashboard pages | Server Components + shadcn + native fetch |
| Store profile settings | `api/owner/settings` + Setting table |

---

## Phase 6 — Worker Dashboard ✅

**Goal:** Worker views and updates assigned tasks.

### Diagram

```
 /worker/*
      │
      ▼
 getWorkerUser() ── session + WORKER role
      │
      ▼
 ┌───────────────────────────────┐
 │  scoped to worker profile      │
 │  tasks:  WHERE workerId = me   │
 │  orders: related to my tasks   │
 └───────────────────────────────┘
      │
      ▼
 update task status ──► logAudit
```

### Technology used

| Task | Tech |
|------|------|
| Worker tasks API + task status update | Prisma scoped by worker profile |
| Worker orders API | Prisma join orders ↔ tasks |
| Worker dashboard / task detail pages | Server Components + shadcn + native fetch |

---

## Phase 7 — Security + Responsive Polish ✅

**Goal:** Security hardened; mobile/tablet/desktop responsive.

### Diagram

```
Security layers
──────────────
 1. Auth (edge)        Supabase SSR cookies
 2. Auth (API)         getSession()
 3. Role               getAdminUser/getOwnerUser/getWorkerUser
 4. Permission         can(role, permission)
 5. Validation         Zod schemas at trust boundaries
 6. Rate limiting      rateLimitError() — in-memory counter
 7. Auditing           logAudit() on every mutation
```

### Technology used

| Task | Tech |
|------|------|
| Rate limiting | `src/lib/rate-limit.ts` (in-memory burst limiter; upgrade to Redis when distributed) |
| Input validation | Zod on signup, checkout, create-order |
| Price validation (server-side) | Prisma re-read of variant prices |
| Responsive / touch targets / overflow | Tailwind breakpoints + CSS (`≥44px` targets) |

---

## Phase 8 — Documentation ✅

**Goal:** Complete docs for AI agents and developers.

### Diagram

```
Repo docs
├── AGENTS.md                        stack + conventions
├── README.md                        setup + demo logins
├── IMPLEMENTATION_PLAN.md           original plan (8 phases)
├── PRODUCT_SPEC.md                  consolidated product spec + gap analysis
├── ADMIN_DASHBOARD_REFERENCE.md     admin panel reference
├── PHASES_AND_TECHNOLOGY.md         this file
├── LICENSE                          MIT
└── docs/
    ├── architecture/{ARCHITECTURE, DATABASE, AUTH_FLOW, SECURITY}.md
    ├── admin/ADMIN.md
    ├── owner/OWNER.md
    └── worker/WORKER.md
```

### Technology used

| File | Purpose |
|------|---------|
| All `.md` | Markdown (GitHub-flavored, ASCII / Mermaid-style diagrams) |

---

## Future Phases (from PRODUCT_SPEC gap analysis)

| Phase | Work | Status |
|-------|------|--------|
| 9 | Worker task-assignment UI (Admin→Worker) | 🔜 |
| 10 | Coupon / discount engine | 🔜 |
| 11 | Sales / traffic reports + support tickets | 🔜 |
| 12 | Permission Console (Owner unlocks) + DB override table | 🔜 |
| 13 | Reseller MVP (model, referral links, commission ledger, payouts) | 🔜 |
| 14 | Macro controls (feature flags, maintenance mode, backup) | 🔜 |
