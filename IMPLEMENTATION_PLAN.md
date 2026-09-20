# IMPLEMENTATION PLAN — Admin Panel, Owner/Worker Operations & RBAC

> **Status:** Draft — awaiting approval before implementation begins.
> **Date:** 2026-08-31
> **Ponytail level:** full

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Architecture Decisions](#2-architecture-decisions)
3. [System Architecture Diagram](#3-system-architecture-diagram)
4. [Database Schema Changes](#4-database-schema-changes)
5. [Auth & RBAC Flow](#5-auth--rbac-flow)
6. [Role Hierarchy](#6-role-hierarchy)
7. [API Routes](#7-api-routes)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Owner Dashboard](#9-owner-dashboard)
10. [Worker Dashboard](#10-worker-dashboard)
11. [Implementation Phases](#11-implementation-phases)
12. [File Inventory](#12-file-inventory)
13. [Security Rules](#13-security-rules)
14. [What I'm NOT Building](#14-im-not-building)
15. [Verification Checklist](#15-verification-checklist)

---

## 1. Current State Audit

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.5 (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 + shadcn/ui tokens |
| Database | PostgreSQL via Prisma 5.18 |
| Auth | NextAuth v4 (Credentials provider, JWT) |
| Payments | Stripe (PaymentIntents) |
| State | Zustand (cart, wishlist — localStorage) |
| 3D | Three.js / React Three Fiber |
| Animation | Framer Motion |
| CMS | Sanity (installed, UNUSED) |

### What Exists

```
src/
├── app/
│   ├── page.tsx                  ← Homepage (3D hero, featured products)
│   ├── layout.tsx                ← Root layout (providers, font, metadata)
│   ├── globals.css               ← shadcn/ui CSS tokens
│   ├── not-found.tsx             ← 404 page
│   ├── auth/signin/page.tsx      ← Sign-in (credentials)
│   ├── auth/signup/page.tsx      ← Sign-up
│   ├── products/page.tsx         ← Product listing (HARDCODED data)
│   ├── products/[slug]/page.tsx  ← Product detail (HARDCODED)
│   ├── categories/[slug]/page.tsx← Category filter (HARDCODED)
│   ├── checkout/page.tsx         ← Multi-step checkout
│   ├── checkout/success/page.tsx ← Order confirmation
│   ├── account/page.tsx          ← Account dashboard (minimal)
│   ├── account/orders/page.tsx   ← STUB — always "No orders"
│   ├── account/wishlist/page.tsx ← Client-side wishlist
│   ├── vendor/apply/page.tsx     ← COSMETIC — no API call
│   ├── contact/page.tsx          ← COSMETIC — no API call
│   ├── shipping/page.tsx         ← Static info
│   ├── returns/page.tsx          ← Static info
│   ├── privacy/page.tsx          ← Static info
│   ├── terms/page.tsx            ← Static info
│   ├── cookies/page.tsx          ← Static info
│   ├── help/page.tsx             ← Static info
│   └── api/
│       ├── auth/[...nextauth]/   ← NextAuth handler
│       ├── auth/signup/          ← User registration
│       ├── checkout/             ← Stripe PaymentIntent
│       └── create-order/         ← Persist order (NO AUTH)
├── components/
│   ├── navbar.tsx, footer.tsx, cart-drawer.tsx
│   ├── product-card.tsx, providers.tsx
│   ├── 3d/hero-scene.tsx, jersey-viewer.tsx
│   └── ui/button, card, input, badge, tabs, toaster
├── lib/
│   ├── auth.ts          ← NextAuth config (hardcoded fallback secret!)
│   ├── prisma.ts        ← Prisma singleton
│   ├── products.ts      ← HARDCODED 12-product array (DELETE)
│   ├── sanity.ts        ← UNUSED (DELETE)
│   ├── stripe.ts        ← Stripe client setup
│   └── utils.ts         ← cn, formatPrice, slugify, truncate
├── store/
│   ├── cart.ts          ← Zustand cart (localStorage)
│   └── wishlist.ts      ← Zustand wishlist (localStorage)
└── middleware.ts         ← NextAuth middleware (checks /account, /vendor only)
```

### What Does NOT Exist (zero implementation)

- No admin panel or admin routes
- No owner dashboard
- No worker dashboard
- No RBAC enforcement (roles exist in DB but are never checked)
- No permission system
- No audit logging
- No API authorization (all 4 routes are public)
- No task/assignment system
- No notification system
- No content management
- No version history

### Critical Bugs & Security Issues

| Issue | Location | Severity |
|-------|----------|----------|
| Hardcoded NextAuth fallback secret | `src/lib/auth.ts:50` | CRITICAL |
| Admin credentials in production UI | `auth/signin/page.tsx:87` | CRITICAL |
| No auth on `/api/checkout` | `api/checkout/route.ts` | HIGH |
| No auth on `/api/create-order` | `api/create-order/route.ts` | HIGH |
| Client-controlled order amounts | `api/checkout/route.ts` | HIGH |
| Orders assigned to `findFirst()` user | `api/create-order/route.ts:44` | HIGH |
| Orders page is a stub | `account/orders/page.tsx` | MEDIUM |
| Contact form non-functional | `contact/page.tsx` | LOW |
| Vendor apply form non-functional | `vendor/apply/page.tsx` | LOW |
| Unused Sanity dependency | `src/lib/sanity.ts` | LOW |

---

## 2. Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Roles** | CUSTOMER → OWNER (replaces VENDOR) → WORKER → ADMIN | Owner IS the vendor. Removes VENDOR/OWNER overlap. Worker = owner's employee. |
| **Permissions** | `can(role, action)` helper function, NOT a database permission table | 4 roles don't need 50 boolean flags. A simple object map is sufficient. Upgrade path: permission table when roles exceed 6. |
| **Product data** | Fetch from Prisma DB, delete hardcoded array | Admin panel managing hardcoded data is pointless. |
| **Admin UI** | Extend existing shadcn/ui components | Button, Card, Input, Tabs, Badge already exist. No new UI libraries. |
| **State management** | Server Components for dashboards, Zustand for client cart/wishlist | Dashboards benefit from server rendering. Cart/wishlist already work with Zustand. |
| **Audit logging** | Database table + `logAudit()` helper | Simple, queryable, no external service dependency. |
| **Route protection** | NextAuth middleware + server-side `getSession()` checks | Defense in depth: middleware blocks unauthenticated access, server checks verify role. |

---

## 3. System Architecture Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Homepage │ │ Products │ │ Checkout │ │    Admin Panel   │   │
│  │  (Public)│ │ (Public) │ │ (Auth'd) │ │   (ADMIN only)   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                                                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐  │
│  │  Owner Dashboard │ │ Worker Dashboard │ │  Account Pages │  │
│  │  (OWNER only)    │ │ (WORKER only)    │ │  (Any auth'd)  │  │
│  └──────────────────┘ └──────────────────┘ └────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼───────────────────────────────────┐
│                     NEXT.JS SERVER                              │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    MIDDLEWARE                            │    │
│  │  Session check → Role check → Route protection          │    │
│  │  /admin/* → ADMIN only                                  │    │
│  │  /owner/* → OWNER only                                  │    │
│  │  /worker/* → WORKER only                                │    │
│  │  /account/* → any authenticated user                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   API ROUTES                            │    │
│  │                                                         │    │
│  │  /api/auth/*          → NextAuth (signin, signup, etc.) │    │
│  │  /api/checkout        → Stripe PaymentIntent            │    │
│  │  /api/create-order    → Persist order                   │    │
│  │  /api/admin/*         → Admin CRUD + stats              │    │
│  │  /api/owner/*         → Owner-scoped CRUD               │    │
│  │  /api/worker/*        → Worker task operations          │    │
│  │  /api/audit           → Audit log queries               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   LIB LAYER                             │    │
│  │                                                         │    │
│  │  auth.ts      → NextAuth config                         │    │
│  │  session.ts   → getSession() helper                     │    │
│  │  rbac.ts      → can(role, action) permission check      │    │
│  │  api-guard.ts → API authorization middleware             │    │
│  │  audit.ts     → logAudit() writes to AuditLog table     │    │
│  │  prisma.ts    → Prisma client singleton                 │    │
│  │  stripe.ts    → Stripe client                           │    │
│  │  utils.ts     → cn, formatPrice, slugify                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                      PostgreSQL                                 │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │   Users    │ │  Products  │ │    Orders    │ │   Audit   │  │
│  │   Roles    │ │  Variants  │ │  OrderItems  │ │    Logs   │  │
│  │  Sessions  │ │ Categories │ │   Payouts    │ │           │  │
│  │  Accounts  │ │    Tags    │ │  Addresses   │ │           │  │
│  └────────────┘ └────────────┘ └──────────────┘ └───────────┘  │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌───────────┐  │
│  │  Owners    │ │  Workers   │ │    Tasks     │ │Notificatns│  │
│  │ (replaces  │ │ (new)      │ │   (new)      │ │  (new)    │  │
│  │  Vendors)  │ │            │ │              │ │           │  │
│  └────────────┘ └────────────┘ └──────────────┘ └───────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
Browser Request
      │
      ▼
┌─────────────┐
│  Middleware  │ ──── No session? → Redirect to /auth/signin
│  (NextAuth)  │ ──── Wrong role? → 403
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Route  │ ──── getSession() → verify role → can(role, action)?
│  Handler    │ ──── Ownership check (OWNER can only see their data)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Prisma     │ ──── Query with scoped filters
│  Query      │ ──── (OWNER: where vendorId = session.user.id)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Audit Log  │ ──── logAudit() records the action
│  (optional) │
└──────┬──────┘
       │
       ▼
  JSON Response
```

---

## 4. Database Schema Changes

### Current Roles

```prisma
enum Role {
  CUSTOMER
  VENDOR
  ADMIN
}
```

### New Roles

```prisma
enum Role {
  CUSTOMER
  OWNER    // Replaces VENDOR — the store owner
  WORKER   // NEW — owner's employee
  ADMIN    // Site administrator
}
```

### New Models

```prisma
// ============ Workers ============
model Worker {
  id        String  @id @default(cuid())
  ownerId   String              // FK to User who is an OWNER
  owner     User   @relation(...)
  userId    String  @unique     // FK to the worker's User account
  user      User   @relation(...)
  name      String
  email     String
  phone     String?
  status    WorkerStatus @default(ACTIVE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tasks Task[]
}

// ============ Tasks ============
model Task {
  id          String     @id @default(cuid()
  title       String
  description String?    @db.Text
  status      TaskStatus @default(PENDING)
  priority    TaskPriority @default(MEDIUM)
  workerId    String?
  worker      Worker?    @relation(fields: [workerId], references: [id])
  orderId     String?               // Optional link to an order
  order       Order?     @relation(fields: [orderId], references: [id])
  dueDate     DateTime?
  notes       String?    @db.Text
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([workerId])
  @@index([status])
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

// ============ Audit Log ============
model AuditLog {
  id         String   @id @default(cuid())
  actorId    String                // Who did it
  actorEmail String                // Denormalized for display
  actorRole  Role                  // Role at time of action
  action     String                // e.g. "product.create", "order.update_status"
  resource   String                // e.g. "product", "order", "user"
  resourceId String?               // ID of affected resource
  oldValues  Json?                 // Previous state
  newValues  Json?                 // New state
  ip         String?               // Request IP (where legally appropriate)
  result     String  @default("success")  // success | failure
  createdAt  DateTime @default(now())

  @@index([actorId])
  @@index([resource, resourceId])
  @@index([createdAt])
}

// ============ Notifications ============
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String   @db.Text
  type      String                // info, warning, success, error
  read      Boolean @default(false)
  link      String?               // Optional URL to navigate to
  createdAt DateTime @default(now())

  @@index([userId, read])
}

// ============ Settings ============
model Setting {
  id    String @id @default(cuid())
  key   String @unique
  value Json
  updatedAt DateTime @updatedAt
}
```

### Schema Diagram (ER)

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│   User   │────<│   Account    │     │ Session  │
│          │────<│              │     │          │
│  role    │────<└──────────────┘     └──────────┘
│          │
│          │────<┌──────────────┐
│          │     │  Address     │
│          │────<└──────────────┘
│          │
│          │────<┌──────────────┐
│          │     │  Order       │────<┌─────────────┐
│          │     │              │     │  OrderItem   │
│          │     └──────┬───────┘     └─────────────┘
│          │            │
│          │            │ optional
│          │            ▼
│          │     ┌──────────────┐
│          │     │    Task      │
│          │     │  (assigned   │
│          │     │   to worker) │
│          │     └──────────────┘
│          │
│          │────<┌──────────────┐
│          │     │ WishlistItem │
│          │────<└──────────────┘
│          │
│          │────<┌──────────────┐
│          │     │   Review     │
│          │────<└──────────────┘
│          │
│          │────<┌──────────────┐
│          │     │  CartItem    │
│          │────<└──────────────┘
│          │
│          │────<┌──────────────┐
│          │     │ Notification │
│          │────<└──────────────┘
│          │
│   ┌──────┴───────┐
│   │  Owner       │ (when role=OWNER)
│   │  storeName   │
│   │  stripeId    │
│   │  commission  │
│   │  status      │
│   └──────┬───────┘
│          │
│          │────<┌──────────────┐
│          │     │   Worker     │
│          │     │   (employee) │
│          │     └──────┬───────┘
│          │            │
│          │            │────<┌────────────┐
│          │            │     │    Task     │
│          │            │     │ (assigned)  │
│          │            │     └────────────┘
│          │
│          │────<┌──────────────┐
│          │     │   Product    │────<┌─────────────┐
│          │     │              │     │ ProductImage  │
│          │     │              │     ├─────────────┤
│          │     │              │     │ProductVariant│
│          │     │              │     ├─────────────┤
│          │     │              │     │ ProductTag   │
│          │     └──────────────┘     └─────────────┘
│          │
│          │────<┌──────────────┐
└──────────┘     │  AuditLog    │
                 │  (actor)     │
                 └──────────────┘

┌──────────┐     ┌──────────────┐
│ Category │────<│   Product    │
│          │     └──────────────┘
└──────────┘

┌──────────┐
│   Tag    │────<┌──────────────┐
│          │     │ ProductTag   │
└──────────┘     └──────────────┘

┌──────────┐
│  Setting │ (key-value store)
└──────────┘
```

---

## 5. Auth & RBAC Flow

### Authentication Flow

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  User    │────>│ /auth/signin │────>│  NextAuth    │
│          │     │  (form)      │     │  Credentials │
└──────────┘     └─────────────┘     │  Provider    │
                                     └──────┬───────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │  Verify:                   │
                              │  1. User exists?           │
                              │  2. Password matches?      │
                              │  3. Return user + role     │
                              └─────────────┬─────────────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │  JWT Token created:        │
                              │  { id, email, role }       │
                              │  Stored in cookie          │
                              └─────────────┬─────────────┘
                                            │
                              ┌─────────────▼─────────────┐
                              │  Session callback:         │
                              │  session.user.id = token.id│
                              │  session.user.role= token.role│
                              └───────────────────────────┘
```

### RBAC Check Flow (Every Request)

```
Incoming Request
       │
       ▼
┌──────────────────┐
│ NextAuth Middleware│
│ (runs on matched  │
│  routes only)     │
└────────┬─────────┘
         │
    ┌────▼────┐
    │ Session │──── No session? → 302 → /auth/signin
    │ exists? │
    └────┬────┘
         │ Yes
         ▼
┌──────────────────┐
│ Route role check │──── /admin/* + role ≠ ADMIN? → 403
│ (middleware)      │──── /owner/* + role ≠ OWNER? → 403
│                   │──── /worker/* + role ≠ WORKER? → 403
└────────┬─────────┘
         │ Role OK
         ▼
┌──────────────────┐
│ API Guard        │
│ getSession()     │──── Returns typed user with role
│ can(role, action)│──── Checks if role has permission
└────────┬─────────┘
         │ Authorized
         ▼
┌──────────────────┐
│ Ownership Check  │
│ (OWNER/WORKER)   │──── OWNER: vendorId must match
│                   │──── WORKER: must be assigned
└────────┬─────────┘
         │ Authorized
         ▼
┌──────────────────┐
│ Execute Action   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Audit Log        │
│ logAudit(...)    │
└──────────────────┘
```

### Permission Map (`src/lib/rbac.ts`)

```typescript
const PERMISSIONS: Record<Role, string[]> = {
  ADMIN: [
    'users.view', 'users.create', 'users.update', 'users.delete',
    'owners.view', 'owners.approve', 'owners.suspend',
    'workers.view', 'workers.create', 'workers.update', 'workers.delete',
    'products.view', 'products.create', 'products.update', 'products.delete',
    'orders.view', 'orders.update',
    'categories.view', 'categories.create', 'categories.update', 'categories.delete',
    'audit.view',
    'settings.view', 'settings.update',
  ],
  OWNER: [
    'products.view', 'products.create', 'products.update', 'products.delete',
    'orders.view', 'orders.update',
    'workers.view', 'workers.create', 'workers.update', 'workers.delete',
    'tasks.view', 'tasks.create', 'tasks.update', 'tasks.delete',
    'profile.view', 'profile.update',
  ],
  WORKER: [
    'tasks.view', 'tasks.update',
    'orders.view',
  ],
  CUSTOMER: [
    'products.view',
    'orders.view.own',
    'profile.view', 'profile.update',
    'wishlist.view', 'wishlist.manage',
  ],
};
```

---

## 6. Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                          ADMIN                                  │
│  • Full system management                                       │
│  • Manage all users, owners, workers                            │
│  • Manage all products, categories, orders                      │
│  • View audit logs                                              │
│  • System settings                                              │
│  • Can access: /admin/*                                         │
├─────────────────────────────────────────────────────────────────┤
│                          OWNER                                  │
│  • Manage their own store (products, categories)                │
│  • Manage their workers (create, assign, remove)                │
│  • View their orders                                            │
│  • Cannot access other owners' data                             │
│  • Cannot access admin settings                                 │
│  • Can access: /owner/*                                         │
├─────────────────────────────────────────────────────────────────┤
│                          WORKER                                 │
│  • View assigned tasks                                          │
│  • Update task status                                           │
│  • View orders related to their tasks                           │
│  • Cannot manage products                                       │
│  • Cannot manage other workers                                  │
│  • Can access: /worker/*                                        │
├─────────────────────────────────────────────────────────────────┤
│                         CUSTOMER                                │
│  • Browse products                                              │
│  • Place orders                                                 │
│  • Manage wishlist                                              │
│  • View own orders                                              │
│  • Can access: /products, /checkout, /account                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Isolation Rules

| Role | Can see | Cannot see |
|------|---------|-----------|
| ADMIN | Everything | — |
| OWNER | Only their products, their workers, their orders | Other owners' data, system settings |
| WORKER | Only tasks assigned to them, related orders | Other workers' tasks, products, users |
| CUSTOMER | Published products, their own orders/wishlist | Any other user's data, admin panels |

---

## 7. API Routes

### Existing Routes (modified)

| Route | Method | Auth | Changes |
|-------|--------|------|---------|
| `/api/auth/[...nextauth]` | GET, POST | Public | No change |
| `/api/auth/signup` | POST | Public | Add rate limiting |
| `/api/checkout` | POST | **Require auth** | Validate prices server-side |
| `/api/create-order` | POST | **Require auth** | Use authenticated user, validate prices |

### New Admin Routes

| Route | Method | Auth | Permission | Purpose |
|-------|--------|------|------------|---------|
| `/api/admin/stats` | GET | ADMIN | `admin.view` | Dashboard statistics |
| `/api/admin/users` | GET | ADMIN | `users.view` | List all users |
| `/api/admin/users` | PATCH | ADMIN | `users.update` | Update user role |
| `/api/admin/owners` | GET | ADMIN | `owners.view` | List all owners |
| `/api/admin/owners` | PATCH | ADMIN | `owners.approve` | Approve/suspend owner |
| `/api/admin/workers` | GET | ADMIN | `workers.view` | List all workers |
| `/api/admin/products` | GET | ADMIN | `products.view` | List all products |
| `/api/admin/products` | POST | ADMIN | `products.create` | Create product |
| `/api/admin/products/[id]` | PATCH | ADMIN | `products.update` | Update product |
| `/api/admin/products/[id]` | DELETE | ADMIN | `products.delete` | Delete product |
| `/api/admin/orders` | GET | ADMIN | `orders.view` | List all orders |
| `/api/admin/orders/[id]` | PATCH | ADMIN | `orders.update` | Update order status |
| `/api/admin/categories` | GET | ADMIN | `categories.view` | List categories |
| `/api/admin/categories` | POST | ADMIN | `categories.create` | Create category |
| `/api/admin/categories/[id]` | PATCH | ADMIN | `categories.update` | Update category |
| `/api/admin/categories/[id]` | DELETE | ADMIN | `categories.delete` | Delete category |
| `/api/admin/audit` | GET | ADMIN | `audit.view` | Query audit logs |
| `/api/admin/settings` | GET | ADMIN | `settings.view` | Get settings |
| `/api/admin/settings` | PATCH | ADMIN | `settings.update` | Update settings |

### New Owner Routes

| Route | Method | Auth | Permission | Purpose |
|-------|--------|------|------------|---------|
| `/api/owner/stats` | GET | OWNER | `owner.view` | Dashboard stats (their data) |
| `/api/owner/products` | GET | OWNER | `products.view` | List their products |
| `/api/owner/products` | POST | OWNER | `products.create` | Create product |
| `/api/owner/products/[id]` | PATCH | OWNER | `products.update` | Update their product |
| `/api/owner/products/[id]` | DELETE | OWNER | `products.delete` | Delete their product |
| `/api/owner/orders` | GET | OWNER | `orders.view` | Orders with their products |
| `/api/owner/workers` | GET | OWNER | `workers.view` | List their workers |
| `/api/owner/workers` | POST | OWNER | `workers.create` | Add worker |
| `/api/owner/workers/[id]` | PATCH | OWNER | `workers.update` | Update worker |
| `/api/owner/workers/[id]` | DELETE | OWNER | `workers.delete` | Remove worker |
| `/api/owner/tasks` | GET | OWNER | `tasks.view` | Tasks for their workers |
| `/api/owner/tasks` | POST | OWNER | `tasks.create` | Create task |
| `/api/owner/tasks/[id]` | PATCH | OWNER | `tasks.update` | Update task |

### New Worker Routes

| Route | Method | Auth | Permission | Purpose |
|-------|--------|------|------------|---------|
| `/api/worker/tasks` | GET | WORKER | `tasks.view` | Their assigned tasks |
| `/api/worker/tasks/[id]` | PATCH | WORKER | `tasks.update` | Update task status/notes |
| `/api/worker/orders` | GET | WORKER | `orders.view` | Orders related to their tasks |

---

## 8. Admin Dashboard

### Navigation Structure

```
/admin
├── Dashboard          ← Stats, recent orders, recent activity
├── Users              ← User table, role management
├── Owners             ← Owner table, approve/suspend
├── Workers            ← Worker table
├── Products           ← Product table, CRUD
│   └── New Product    ← Create form
│   └── Edit Product   ← Edit form
├── Orders             ← Order table, status management
├── Categories         ← Category table, CRUD
├── Audit Log          ← Searchable log table
└── Settings           ← Site configuration
```

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────┐  Admin Panel                    🔔  👤 Admin ▼    │
│  │ Logo │                                            │
│  └──────┘                                            │
├────────┬─────────────────────────────────────────────┤
│        │                                             │
│ Dash   │  ┌─────────────────────────────────────┐   │
│ Users  │  │  Page Header                        │   │
│ Owners │  │  Stats / Filters / Actions           │   │
│ Workers│  └─────────────────────────────────────┘   │
│ Products│                                            │
│ Orders │  ┌─────────────────────────────────────┐   │
│ Categ. │  │  Data Table                          │   │
│ Audit  │  │  Search | Sort | Pagination          │   │
│ Settings│ │                                      │   │
│        │  │  Row 1 ...                           │   │
│        │  │  Row 2 ...                           │   │
│        │  │  Row 3 ...                           │   │
│        │  └─────────────────────────────────────┘   │
│        │                                             │
└────────┴─────────────────────────────────────────────┘
```

### Mobile Admin Layout

```
┌──────────────────────┐
│ ☰  Admin Panel       │
├──────────────────────┤
│                      │
│  ┌────────────────┐  │
│  │  Stats (2-col) │  │
│  │  ┌────┐┌────┐  │  │
│  │  │ 12 ││ $5k│  │  │
│  │  │users││rev │  │  │
│  │  └────┘└────┘  │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │  Table          │  │
│  │  (scrollable)   │  │
│  │  ┌──────────┐   │  │
│  │  │ Name  ...│   │  │
│  │  │ Name  ...│   │  │
│  │  └──────────┘   │  │
│  └────────────────┘  │
│                      │
└──────────────────────┘
```

---

## 9. Owner Dashboard

### Navigation Structure

```
/owner
├── Dashboard          ← Their stats, recent orders
├── Products           ← Their product table, CRUD
│   └── New Product
│   └── Edit Product
├── Orders             ← Orders containing their products
├── Workers            ← Manage their workers
│   └── Assign tasks
├── Tasks              ← Create/manage tasks for workers
└── Settings           ← Store profile
```

### Data Scope

Everything an OWNER sees is filtered by their `vendorId`:

```sql
-- Products: only this owner's
SELECT * FROM Product WHERE vendorId = :ownerVendorId

-- Workers: only this owner's
SELECT * FROM Worker WHERE ownerId = :ownerUserId

-- Orders: only those containing this owner's products
SELECT * FROM Order
WHERE id IN (
  SELECT oi.orderId FROM OrderItem oi
  JOIN Product p ON oi.productId = p.id
  WHERE p.vendorId = :ownerVendorId
)
```

---

## 10. Worker Dashboard

### Navigation Structure

```
/worker
├── Dashboard    ← Task summary, pending/completed counts
├── Tasks        ← All assigned tasks
│   └── Task Detail  ← Update status, add notes
```

### Mobile-First Design

```
┌──────────────────────────┐
│  ☰  Worker Dashboard     │
├──────────────────────────┤
│                          │
│  ┌────────────────────┐  │
│  │  PENDING     5     │  │
│  │  IN PROGRESS  2    │  │
│  │  COMPLETED   12    │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │ 📦 Order #1234     │  │
│  │ Pack jerseys       │  │
│  │ Due: Tomorrow      │  │
│  │ [Mark Complete]    │  │
│  └────────────────────┘  │
│                          │
│  ┌────────────────────┐  │
│  │ 📦 Order #1235     │  │
│  │ Ship to customer   │  │
│  │ Due: Wednesday     │  │
│  │ [Start]            │  │
│  └────────────────────┘  │
│                          │
└──────────────────────────┘
```

- Large touch targets (≥44px)
- Minimal navigation (2 items max)
- Clear color-coded status badges
- One-tap actions where possible

---

## 11. Implementation Phases

### Phase 1: Schema + Foundation Fix

**Goal:** Database supports new roles. Broken things are fixed. Hardcoded data removed.

| Task | Files | Details |
|------|-------|---------|
| Schema migration | `prisma/schema.prisma` | Add OWNER/WORKER roles, Worker/Task/AuditLog/Notification/Setting models |
| Seed update | `prisma/seed.ts` | Use upsert, add OWNER+WORKER demo users |
| Delete hardcoded products | `src/lib/products.ts` | DELETE. All pages switch to DB queries |
| Delete unused Sanity | `src/lib/sanity.ts` | DELETE. Remove import from any file |
| Fix auth secret | `src/lib/auth.ts` | Throw error if NEXTAUTH_SECRET missing |
| Remove demo creds | `src/app/auth/signin/page.tsx` | Remove admin credentials from UI |
| Fix checkout auth | `src/app/api/checkout/route.ts` | Require session |
| Fix create-order | `src/app/api/create-order/route.ts` | Use authenticated user, validate prices |
| Product pages to DB | `src/app/products/page.tsx`, `[slug]/page.tsx`, `categories/[slug]/page.tsx` | Fetch from Prisma |
| Homepage to DB | `src/app/page.tsx` | Featured products from Prisma |

### Phase 2: Auth + RBAC

**Goal:** Every protected route checks role. Unauthorized access is blocked.

| Task | Files | Details |
|------|-------|---------|
| RBAC helper | NEW `src/lib/rbac.ts` | `can(role, action)` + permission map |
| Session helper | NEW `src/lib/session.ts` | `getSession()` typed wrapper |
| API guard | NEW `src/lib/api-guard.ts` | `requireAuth(roles[])` for API routes |
| Audit service | NEW `src/lib/audit.ts` | `logAudit()` writes to AuditLog |
| Middleware update | `src/middleware.ts` | Protect /admin/*, /owner/*, /worker/* by role |
| Owner rename | `src/app/vendor/*` | Rename to /owner or remove |
| Notification helper | NEW `src/lib/notifications.ts` | `createNotification()` for in-app notifs |

### Phase 3: Admin Backend API

**Goal:** All admin CRUD endpoints work with auth + audit logging.

| Task | Files | Details |
|------|-------|---------|
| Admin stats | NEW `src/app/api/admin/stats/route.ts` | Dashboard statistics |
| Admin users | NEW `src/app/api/admin/users/route.ts` | List, update role |
| Admin owners | NEW `src/app/api/admin/owners/route.ts` | List, approve/suspend |
| Admin workers | NEW `src/app/api/admin/workers/route.ts` | List |
| Admin products | NEW `src/app/api/admin/products/route.ts` | Full CRUD |
| Admin product [id] | NEW `src/app/api/admin/products/[id]/route.ts` | Update, delete |
| Admin orders | NEW `src/app/api/admin/orders/route.ts` | List, update status |
| Admin order [id] | NEW `src/app/api/admin/orders/[id]/route.ts` | Update status |
| Admin categories | NEW `src/app/api/admin/categories/route.ts` | Full CRUD |
| Admin category [id] | NEW `src/app/api/admin/categories/[id]/route.ts` | Update, delete |
| Admin audit | NEW `src/app/api/admin/audit/route.ts` | Query logs |
| Admin settings | NEW `src/app/api/admin/settings/route.ts` | Get/update |

### Phase 4: Admin Dashboard UI

**Goal:** Functional admin panel with all management pages.

| Task | Files | Details |
|------|-------|---------|
| Admin layout | NEW `src/app/admin/layout.tsx` | Sidebar + auth guard |
| Sidebar | NEW `src/components/admin/sidebar.tsx` | Collapsible nav |
| Data table | NEW `src/components/admin/data-table.tsx` | Reusable table |
| Stat card | NEW `src/components/admin/stat-card.tsx` | Stats display |
| Page header | NEW `src/components/admin/page-header.tsx` | Title + description |
| Dashboard | NEW `src/app/admin/page.tsx` | Stats + recent activity |
| Users | NEW `src/app/admin/users/page.tsx` | User management |
| Owners | NEW `src/app/admin/owners/page.tsx` | Owner management |
| Workers | NEW `src/app/admin/workers/page.tsx` | Worker list |
| Products | NEW `src/app/admin/products/page.tsx` | Product CRUD table |
| Product new | NEW `src/app/admin/products/new/page.tsx` | Create form |
| Product edit | NEW `src/app/admin/products/[id]/page.tsx` | Edit form |
| Orders | NEW `src/app/admin/orders/page.tsx` | Order management |
| Categories | NEW `src/app/admin/categories/page.tsx` | Category CRUD |
| Audit | NEW `src/app/admin/audit/page.tsx` | Log viewer |
| Settings | NEW `src/app/admin/settings/page.tsx` | Config form |

### Phase 5: Owner Backend + Dashboard

**Goal:** Owner can manage their store, workers, and tasks.

| Task | Files | Details |
|------|-------|---------|
| Owner stats API | NEW `src/app/api/owner/stats/route.ts` | Scoped stats |
| Owner products API | NEW `src/app/api/owner/products/route.ts` | Scoped CRUD |
| Owner products [id] | NEW `src/app/api/owner/products/[id]/route.ts` | Update, delete |
| Owner orders API | NEW `src/app/api/owner/orders/route.ts` | Scoped orders |
| Owner workers API | NEW `src/app/api/owner/workers/route.ts` | CRUD |
| Owner workers [id] | NEW `src/app/api/owner/workers/[id]/route.ts` | Update, delete |
| Owner tasks API | NEW `src/app/api/owner/tasks/route.ts` | CRUD |
| Owner tasks [id] | NEW `src/app/api/owner/tasks/[id]/route.ts` | Update |
| Owner layout | NEW `src/app/owner/layout.tsx` | Sidebar + auth |
| Owner dashboard | NEW `src/app/owner/page.tsx` | Stats |
| Owner products | NEW `src/app/owner/products/page.tsx` | Table |
| Owner product new | NEW `src/app/owner/products/new/page.tsx` | Form |
| Owner product edit | NEW `src/app/owner/products/[id]/page.tsx` | Form |
| Owner orders | NEW `src/app/owner/orders/page.tsx` | Table |
| Owner workers | NEW `src/app/owner/workers/page.tsx` | Table |
| Owner tasks | NEW `src/app/owner/tasks/page.tsx` | Table |
| Owner settings | NEW `src/app/owner/settings/page.tsx` | Profile |

### Phase 6: Worker Dashboard

**Goal:** Worker can view and update assigned tasks.

| Task | Files | Details |
|------|-------|---------|
| Worker tasks API | NEW `src/app/api/worker/tasks/route.ts` | Get their tasks |
| Worker task [id] | NEW `src/app/api/worker/tasks/[id]/route.ts` | Update status |
| Worker orders API | NEW `src/app/api/worker/orders/route.ts` | Related orders |
| Worker layout | NEW `src/app/worker/layout.tsx` | Minimal nav + auth |
| Worker dashboard | NEW `src/app/worker/page.tsx` | Task summary |
| Worker tasks | NEW `src/app/worker/tasks/page.tsx` | Task list |
| Worker task detail | NEW `src/app/worker/tasks/[id]/page.tsx` | Update status |

### Phase 7: Security + Responsive Polish

**Goal:** Security hardened. Mobile/tablet/desktop all work.

| Task | Details |
|------|---------|
| Rate limiting | Add to auth endpoints |
| Input validation | Zod schemas on all API routes |
| Responsive audit | Test all dashboards at 320px, 375px, 768px, 1280px, 1920px |
| Fix overflow | Ensure no horizontal scroll on any page |
| Touch targets | ≥44px on mobile |

### Phase 8: Documentation

**Goal:** Complete docs for AI agents and developers.

| File | Content |
|------|---------|
| `AGENTS.md` | Project overview, stack, conventions, how to modify |
| `docs/architecture/ARCHITECTURE.md` | System architecture |
| `docs/architecture/DATABASE.md` | Schema documentation |
| `docs/architecture/AUTH_FLOW.md` | Authentication flow |
| `docs/architecture/SECURITY.md` | Security rules |
| `docs/admin/ADMIN.md` | Admin panel guide |
| `docs/owner/OWNER.md` | Owner panel guide |
| `docs/worker/WORKER.md` | Worker panel guide |

---

## 12. File Inventory

### New Files (~50)

```
src/
├── lib/
│   ├── rbac.ts              ← Permission map + can()
│   ├── session.ts           ← getSession() helper
│   ├── api-guard.ts         ← API authorization
│   ├── audit.ts             ← logAudit() service
│   └── notifications.ts     ← createNotification()
│
├── components/admin/
│   ├── sidebar.tsx          ← Admin sidebar nav
│   ├── data-table.tsx       ← Reusable data table
│   ├── stat-card.tsx        ← Stat display card
│   └── page-header.tsx      ← Page title component
│
├── app/admin/
│   ├── layout.tsx           ← Admin layout
│   ├── page.tsx             ← Dashboard
│   ├── users/page.tsx
│   ├── owners/page.tsx
│   ├── workers/page.tsx
│   ├── products/page.tsx
│   ├── products/new/page.tsx
│   ├── products/[id]/page.tsx
│   ├── orders/page.tsx
│   ├── categories/page.tsx
│   ├── audit/page.tsx
│   └── settings/page.tsx
│
├── app/api/admin/
│   ├── stats/route.ts
│   ├── users/route.ts
│   ├── owners/route.ts
│   ├── workers/route.ts
│   ├── products/route.ts
│   ├── products/[id]/route.ts
│   ├── orders/route.ts
│   ├── orders/[id]/route.ts
│   ├── categories/route.ts
│   ├── categories/[id]/route.ts
│   ├── audit/route.ts
│   └── settings/route.ts
│
├── app/owner/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products/page.tsx
│   ├── products/new/page.tsx
│   ├── products/[id]/page.tsx
│   ├── orders/page.tsx
│   ├── workers/page.tsx
│   ├── tasks/page.tsx
│   └── settings/page.tsx
│
├── app/api/owner/
│   ├── stats/route.ts
│   ├── products/route.ts
│   ├── products/[id]/route.ts
│   ├── orders/route.ts
│   ├── workers/route.ts
│   ├── workers/[id]/route.ts
│   ├── tasks/route.ts
│   └── tasks/[id]/route.ts
│
├── app/worker/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── tasks/page.tsx
│   └── tasks/[id]/page.tsx
│
└── app/api/worker/
    ├── tasks/route.ts
    ├── tasks/[id]/route.ts
    └── orders/route.ts
```

### Modified Files (~15)

```
prisma/schema.prisma           ← New roles + models
prisma/seed.ts                 ← Upsert, new demo users
src/lib/auth.ts                ← Fix secret, add new roles
src/middleware.ts               ← Protect all role routes
src/app/page.tsx               ← DB products
src/app/products/page.tsx      ← DB products
src/app/products/[slug]/page.tsx ← DB products
src/app/categories/[slug]/page.tsx ← DB products
src/app/auth/signin/page.tsx   ← Remove demo creds
src/app/checkout/page.tsx      ← Auth required
src/app/api/checkout/route.ts  ← Auth + price validation
src/app/api/create-order/route.ts ← Auth + user linkage
src/app/account/page.tsx       ← Show role-based links
src/app/navbar.tsx             ← Add admin/owner/worker nav links
src/app/globals.css            ← Add any needed utility classes
```

### Deleted Files (~3)

```
src/lib/products.ts            ← Hardcoded product array
src/lib/sanity.ts              ← Unused Sanity client
src/app/vendor/apply/page.tsx  ← Replaced by /owner
```

### Documentation Files (~10)

```
AGENTS.md
docs/architecture/ARCHITECTURE.md
docs/architecture/DATABASE.md
docs/architecture/AUTH_FLOW.md
docs/architecture/SECURITY.md
docs/admin/ADMIN.md
docs/owner/OWNER.md
docs/worker/WORKER.md
IMPLEMENTATION_PLAN.md          ← This file
```

---

## 13. Security Rules

### Must Do

1. Every API mutation requires authenticated session
2. Role check on every protected route (middleware + server-side)
3. Ownership check: OWNER only sees their data, WORKER only their tasks
4. Input validation with Zod on all API routes
5. Server-side price validation on checkout (never trust client amounts)
6. Audit logging on all mutations (create, update, delete)
7. Rate limiting on auth endpoints
8. No secrets in frontend code
9. No stack traces exposed to users
10. Proper error messages (generic to user, detailed in logs)

### Must NOT Do

1. Never trust frontend role checks alone
2. Never expose internal IDs unnecessarily
3. Never allow OWNER to access other OWNER's data
4. Never allow WORKER to access admin/owner functions
5. Never log passwords or tokens
6. Never allow unauthenticated API access to mutation endpoints

---

## 14. What I'm NOT Building

| Skipped | Reason | Upgrade Path |
|---------|--------|-------------|
| Full permission table (50 boolean flags) | 4 roles don't need it. `can()` map is sufficient. | Add DB permission table when roles exceed 6 |
| Content version history | Products don't need draft/publish versioning. Orders have status history. | Add when CMS-like workflow is needed |
| Feature flags | No evidence of A/B testing needs. | Add when feature toggling is needed |
| Backup/export UI | Can add to admin settings later. | Add when data export is needed |
| Global search across entities | Each table already has inline search. | Add when records exceed 1000+ per entity |
| Charts/analytics | Stat cards cover the basics. | Add chart library when analytics requirements exist |
| WebSocket notifications | Page refresh is fine for now. | Add when real-time updates are critical |
| File upload for product images | Products use URL-based images. | Add when local storage is needed |
| Email notifications | In-app notifications only. | Add when email delivery is needed |
| Password reset flow | Not in scope. | Add when user-facing auth is needed |
| Two-factor auth | Not in scope. | Add when security requirements increase |
| Rate limiting middleware library | Simple in-memory counter is enough. | Add Redis-based limiter when distributed |

---

## 15. Verification Checklist

After each phase, verify:

- [ ] `npx prisma db push` succeeds (schema changes)
- [ ] `npm run build` succeeds (no TypeScript errors)
- [ ] `npm run lint` passes
- [ ] Sign-in works with all 4 roles
- [ ] Admin can access `/admin/*`
- [ ] Owner can access `/owner/*` but NOT `/admin/*`
- [ ] Worker can access `/worker/*` but NOT `/admin/*` or `/owner/*`
- [ ] Customer CANNOT access any dashboard
- [ ] API routes return 401 when unauthenticated
- [ ] API routes return 403 when wrong role
- [ ] Owner data is scoped to their vendor
- [ ] Worker tasks are scoped to their assignments
- [ ] Products load from database (not hardcoded)
- [ ] Audit logs are created on mutations
- [ ] No horizontal overflow on mobile (320px+)
- [ ] No secrets exposed in client bundle

---

*This plan is ready for review. Approve to begin implementation.*
