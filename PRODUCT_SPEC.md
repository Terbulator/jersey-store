# Product Spec — Jersey Store (Consolidated)

> Supersedes `ecommerce-architecture-role-plan.md` and `ecommerce-full-dashboard-spec.md`.
> Inputs: those two files + the live admin panel (`headerr-store.vercel.app/admin`, built from this repo).
> One authoritative reference for roles, permissions, dashboards, and build priority.

---

## 1. Purpose & Sources

This document merges two earlier specs into one deduplicated reference and grounds it
against what is actually **built and deployed**. It answers three questions:

1. What should the platform be (target state)?
2. What already exists today (deployed reality)?
3. What do we build next, and what do we deliberately not build?

Legend used throughout:

| Mark | Meaning |
|------|---------|
| 🟢 | Open by default |
| 🔴 | Locked by default |
| 🟡 | Locked by default, unlockable by Owner (Permanent / Temporary / One-time) |
| ✅ | Built & deployed |
| 🟡-built | Partially built (MVP of the feature exists) |
| ❌ | Not built |
| 🔜 | Planned / parked with trigger |

---

## 2. System Architecture

From `ecommerce-architecture-role-plan.md` §1 — the target deployment shape.

```
                              ┌─────────────────────────┐
                              │        CDN / WAF         │
                              └────────────┬─────────────┘
                                           │
                              ┌────────────▼─────────────┐
                              │      Load Balancer        │
                              └────────────┬─────────────┘
                 ┌───────────────────────┬─┴───────────────────────┐
                 │                       │                         │
        ┌────────▼────────┐   ┌─────────▼─────────┐     ┌─────────▼─────────┐
        │  Storefront Web  │   │   Admin/Owner      │     │  Reseller Portal   │
        │  (Customer App)  │   │   Dashboard (SPA)  │     │  (Worker + Reseller│
        │                  │   │                    │     │  share this shell) │
        └────────┬─────────┘   └─────────┬──────────┘     └─────────┬─────────┘
                 │                       │                         │
                 └───────────────┬───────┴──────────┬──────────────┘
                                 │                  │
                        ┌────────▼──────────────────▼────────┐
                        │        API Gateway (REST/GraphQL)   │
                        │   Auth, Rate limiting, RBAC checks  │
                        └────────┬─────────────────┬──────────┘
             ┌───────────────────┼─────────────────┼───────────────────┐
             │                   │                 │                   │
     ┌───────▼──────┐   ┌────────▼───────┐  ┌───────▼───────┐  ┌────────▼───────┐
     │  Auth Service  │   │ Catalog Service │  │ Order Service │  │ Payment Service│
     │ (Users/Roles)  │   │ (Products/Stock)│  │ (Cart/Checkout)│  │ (Gateway/Wallet)│
     └───────┬──────┘   └────────┬───────┘  └───────┬───────┘  └────────┬───────┘
             │                   │                 │                   │
     ┌───────▼──────┐   ┌────────▼───────┐  ┌───────▼───────┐  ┌────────▼───────┐
     │ Notification   │   │ Inventory/WMS  │  │ Shipping/     │  │ Reporting &    │
     │ Service (Email/ │   │ Service         │  │ Logistics Svc │  │ Analytics Svc  │
     │ SMS/Push)       │   │                │  │               │  │                │
     └────────────────┘   └────────────────┘  └───────────────┘  └────────────────┘
                                 │
                        ┌────────▼────────┐
                        │   Database Layer │
                        │ (Primary + Read  │
                        │  Replicas + Cache│
                        │  + Search Index) │
                        └──────────────────┘
```

**Current reality (deployed).** The live app is a Next.js 14 (App Router) monolith on Vercel:
one server (middleware auth gate + API routes) backed by PostgreSQL (Prisma) + Supabase auth,
Stripe payments, Zustand client state. It is **not** microservices — the target diagram above is
the aspirational split.

| Layer | Target | Today (deployed) |
|-------|--------|------------------|
| Frontends | Storefront + Admin/Owner SPA + Reseller portal | Same Next.js app (RSC) for all three |
| API | Gateway → auth/catalog/order/payment/notification/inventory/shipping/reporting services | Next.js API routes under `/api/*` |
| Database | Postgres + Redis + Elasticsearch | PostgreSQL (Prisma) only |
| Auth | JWT + refresh, RBAC/ABAC middleware | Supabase SSR cookies + `rbac.ts` `can()` map |
| Payments | Stripe/Razorpay/PayPal layer | Stripe (PaymentIntents) |
| Queue | RabbitMQ/Kafka for order events, stock sync, notifications | none |
| Search | Elasticsearch | SQL queries |
| Hosting | Docker + Kubernetes (or PaaS) | Vercel (serverless) |

> `ponytail:` the target is a multi-service architecture. Do **not** migrate to microservices
> until the monolith is a real bottleneck. The deployed monolith already closes the core loop;
> split services only when a team/scale needs it, and keep Postgres + SQL search until then.

---

## 3. Role Model (Target)



```
        OWNER          (top of business: finances, staff, gateway keys, macro controls)
          │
        ADMIN           (operational control: catalog, orders, workers, reports — no margin/billing)
          │
        WORKER          (task execution, department-scoped)
          │
        RESELLER        (external partner — NEW; scoped like Worker, outside internal chain)

        CUSTOMER        (public buyer — kept from live code for completeness)
```

> `ponytail:` current DB enum is `CUSTOMER | OWNER | WORKER | ADMIN` with **ADMIN topmost**.
> This spec proposes **OWNER above ADMIN** (owner owns finances/gateway; admin runs daily ops).
> That is a real change: new `Role` ordering + permission re-parenting + a `Reseller` model +
> per-override permission table. Do it as one focused migration, not incrementally.

- **OWNER** — 1/few per store. Finances, staff, settings, payment keys, macro switches, audit.
- **ADMIN** — appointed by Owner. Runs daily operations; manages catalog, orders, Workers; no billing/ownership.
- **WORKER** — narrow task access, grouped by department (Fulfillment / Support / Inventory / Content).
- **RESELLER** — external partner reselling at own margin, floor/ceiling enforced, sees own data only.
- **CUSTOMER** — browse, order, wishlist, own orders.

---

## 4. Deployed Admin Panel — Feature Inventory (What Exists Today ✅)

`/admin` (9 sections). Guarded by `getAdminUser()` (session + `role === ADMIN`); mutations
audited via `logAudit()`.

| Section | Actions (today) |
|---------|-----------------|
| **Dashboard** | Stat cards (Users, Owners, Products, Orders, Revenue, Audit events) + recent-orders table |
| **Users** | List/search/filter by role; inline role change (`PATCH /api/admin/users`); pagination |
| **Owners** | List vendors + commission % + product count; filter by status; inline approve/suspend |
| **Workers** | Read-only list (name, email, owner, task count, status); search |
| **Products** | Full CRUD via inline dialog (name, price, compare price, category, vendor, team/season/player/brand, description, published, featured); search + pagination |
| **Orders** | List/filter by status/search; inline status change (`PATCH /api/admin/orders`); payment status badge (read-only); pagination |
| **Categories** | Full CRUD (add/edit via dialog, delete w/ confirm) |
| **Audit Log** | Searchable, paginated log (action, actor, resource, result, timestamp) |
| **Settings** | Single form: site name, currency, tax rate, shipping fee, free-shipping threshold |

**Public storefront (for completeness):** products/categories, product detail, cart, checkout
(Stripe), wishlist, account pages. Role dashboards exist for Owner (`/owner`) and Worker
(`/worker`) alongside Admin.

---

## 5. Spec-vs-Built Gap Matrix

Each spec capability, its deployed status, and where it belongs. *This is the "what's missing" answer.*

| Capability | Today | Where | Priority |
|-----------|-------|-------|----------|
| Role dashboards (Admin/Owner/Worker) | ✅ | all | — |
| Product CRUD + catalog | ✅ | admin/owner | — |
| Order processing + status | ✅ | admin | — |
| Worker list | ✅ | admin | — |
| **Worker task assignment (Admin→Worker)** | ✅ | admin (`/admin/tasks`) | — |
| **Coupons / discounts** | ❌ | admin/owner | **NOW** |
| **Sales / traffic reports** (numbers-only) | ✅ | admin (`/admin/reports`) | — |
| **Support tickets / queue** | ❌ | admin/worker | NOW |
| **Reseller model + referral links** | ❌ | new | NOW |
| **Commission ledger + payouts** | ❌ | new | NOW |
| **Owner Permission Console (🟡 unlocks)** | ❌ | owner | NOW |
| Bulk order actions (assign/process) | ❌ | admin | when painful |
| Refund approval queue (w/ threshold) | ❌ | admin/owner | when painful |
| Feature flags / maintenance mode | ❌ | owner | when painful |
| Fraud / rate-limit rules | partial (`rate-limit`) | owner | when painful |
| P&L / financial reports | ❌ | owner | PARKED |
| Reseller tiers (Bronze→Platinum) | ❌ | new | PARKED |
| Department-scoped worker views | ❌ | worker | PARKED |
| Multi-warehouse / WMS | ❌ | — | NEVER |
| Payroll / shift tracking | ❌ | — | NEVER |
| White-label subdomain storefronts | ❌ | — | NEVER |
| Kafka / Elasticsearch / K8s stack | ❌ | — | NEVER |

---

## 6. Unified Role → Permission Matrix (Target)

Merged from both source specs. `G`=🟢, `L`=🔴, `U`=🟡 (unlock mode in brackets).

| Module | OWNER | ADMIN | WORKER | RESELLER |
|--------|-------|-------|--------|----------|
| Store settings / gateway keys | G | L-U | L | L |
| Financial reports | G | L-U (no margin) | L | G own earnings |
| User & role management | G | U (workers only; others U) | L | L |
| Product CRUD | G | G | L-U (desc/images) | L-U (self-list) |
| Pricing control | G | G (within cap) | L | G within floor/ceiling |
| Inventory mgmt | G | G | U (stock counts, assigned) | U (stock flags) |
| Orders — view | G all | G all | G assigned only | G own only |
| Orders — process | G | G | U (assigned) | L (request only) |
| Customer data | G | G | U (name/ship, no payment) | G own customers |
| Discounts / coupons | G | G (within cap) | L | U (Owner-issued); U own |
| Payout / commission config | G | L-U | L | G view own |
| Marketing / content | G | G | L | U own storefront only |
| Analytics dashboard | G | G | U own metrics | G own metrics |
| Support tickets | G | G | U assigned | G own tickets |
| Audit logs | G full | U own team | L | L |
| Feature flags / maintenance | G | L | L | L |

Grant modes: **Permanent** — stays until reverted; **Temporary** — auto-expires after a
duration; **One-time** — a single pending action approved once.

---

## 7. The Unlock Model ("Locked by Default, Unlockable by Owner")

The core per-role philosophy. Every 🟡 capability can be unlocked by the Owner in one of
three modes (permanent / temporary / one-time). Every grant, revoke, and expiry is written
to the Audit Log (who, to whom, what, when, optional why).

**Owner Permission Console** (new screen, Owner → Staff → Permissions):
- Left: searchable staff list (Admins, Workers, Resellers, by role/department/tier)
- Center: that user's permission list, per module — state 🟢/🔴/🟡, toggle, grant-type selector, reason
- Right: pending "Request Access" approvals (one-click approve/deny)
- Bottom: per-user grant/revoke audit trail

> `ponytail:` the current RBAC is a hardcoded `can()` map (`src/lib/rbac.ts`). The unlock
> model needs a **DB permission/override table**. Add it only when you actually ship the
> Permission Console — not before. Until then, extend the `can()` map if a new role/action appears.

---

## 8. Per-Role Dashboard Specs (Target)

### OWNER
- **Command center** — revenue/profit, order volume, AOV, live order feed, alerts (low stock, failed payments, pending refunds, payout requests, permission requests), top performers, quick actions
- **Financial control** — P&L, revenue by channel, cost tracking, tax config, gateway mgmt, payout runs, multi-currency, expense log; **hide cost/margin from Admin** toggles
- **Staff & roles** — manage Admins/Workers/Resellers, per-user overrides, activity log, "view as" mode
- **Catalog & inventory** — full CRUD, bulk import/export, cost price (hidden), approval workflow
- **Orders & fulfillment** — view/override all, refund approval queue w/ auto-approve threshold, disputes/RMA
- **Pricing, promos & resellers** — pricing rules, coupons, reseller commission tiers, price floors/ceilings, approval flow, white-label toggle
- **Marketing & content** — banners, campaign builder, CMS/SEO, loyalty, integration hub
- **Settings** — identity, shipping zones/rates, payment availability, legal pages, notification templates, API keys, backups
- **Analytics** — sales/traffic/funnel/LTV, staff & reseller performance, custom reports
- **Security** — audit log, 2FA policy, IP allowlist, session viewer, compliance
- **Macro controls** — maintenance mode, feature flags, gateway/courier kill-switch, multi-store, rate-limit/fraud rules, locale rollout, staging toggle, announcement & emergency broadcast

### ADMIN (daily ops)
- **Orders queue** — all orders, assign to Workers, bulk actions; **admin assigns tasks** (build ✅ via `/admin/tasks`)
- **Catalog** — CRUD, categories, stock levels
- **Coupons** — create/manage within Owner-set max % (gap)
- **Support queue** — tickets; refunds below Owner-set threshold (gap)
- **Workers** — create, assign tasks, view performance
- **Reports** — sales/traffic numbers only, no cost/profit unless unlocked (build ✅ via `/admin/reports`)
- **Reseller applications** — review/approve, route to Owner if configured (gap)
- **"Request Access"** button next to every 🔴/🟡 feature → pings Owner (gap)

### WORKER (department-scoped)
- **My Tasks** — assigned orders/tickets/stock jobs, one-tap status updates (pack→ship), print packing slip/label
- **Stock** — update counts for assigned SKUs
- **Support** — respond to assigned tickets via approved templates
- **Notes** — internal notes on orders
- **Performance** — own task metrics
- (Time clock + team-wide queue = unlockable)

### RESELLER (NEW)
- Catalog for resale w/ wholesale cost + suggested range
- Set resale price within floor/ceiling
- Referral link / coupon / (optional) mini-storefront
- Own orders, own customers, own commission ledger
- Payout request + history
- Marketing assets, support requests
- **Tiers** (parked): Bronze / Silver / Gold / Platinum — each auto-applies a bundle of unlocks

### CUSTOMER
- Browse, product detail, cart, checkout (built ✅), wishlist, orders, profile

---

## 9. Module Inventory (14 core modules)

| # | Module | Status |
|---|--------|--------|
| 1 | Product catalog | ✅ built |
| 2 | Inventory mgmt | 🟡-built (stock on variants) |
| 3 | Order management | ✅ built |
| 4 | Payments (Stripe) | ✅ built |
| 5 | Shipping/logistics | 🟡-built (fee config only) |
| 6 | Customer CRM | 🟡-built (account/orders) |
| 7 | Pricing & promotions | ❌ (coupons) |
| 8 | Reseller/affiliate engine | ❌ |
| 9 | Notifications | 🟡-built (in-app table only) |
| 10 | Analytics & reporting | ❌ |
| 11 | Staff/task management | 🟡-built (tasks, no assignment UI) |
| 12 | Content/marketing | ❌ |
| 13 | Security & audit | ✅ built (audit + guards) |
| 14 | Settings/config | 🟡-built (5-field form) |

---

## 10. MVP Launch-Gate & Build Priority

**Build NOW** (needed to be a real store / unblock core workflows):
- Worker task-assignment UI (Admin assigns orders/tasks to Workers)
- Coupon/discount engine (create, limits, cap)
- Sales/traffic reports (numbers-only) + support ticket queue
- **Permission Console MVP** — DB override table + 🟡 grant (permanent/one-time first; temporary when needed)
- **Reseller MVP** — reseller model + referral link + commission ledger + floor/ceiling + payout request

**Build WHEN IT HURTS** (trigger-based, not speculative):
- DB permission table — *only* when Permission Console ships (see §6 ponytail note)
- Bulk order actions — when per-row processing is a real bottleneck
- Refund approval queue w/ threshold — when refund volume exceeds manual review
- Feature flags / maintenance mode — when you deploy risky changes or need a kill-switch
- Temporary/time-boxed unlocks — only if permanent unlocks get abused
- Fraud/rate-limit rules — extend as abuse appears (simple in-memory limiter exists)

**NEVER (parked elephants)** — do not build until there is hard evidence:
- Multi-warehouse / full WMS
- Payroll / shift / attendance tracking
- White-label subdomain storefronts (start with referral links, not subdomains)
- Kafka / Elasticsearch / Kubernetes
- Full P&L granularity / accounting exports
- Reseller tier system — implement as plain per-user config until tier volume justifies it

> `ponytail:` "build when it hurts" is the governing rule. The deployed system already covers
> the closed loop (catalog → cart → checkout → order → admin ops). Don't add infrastructure
> or elaborated features before a real workflow demands them.

---

## 11. Security & Governance

- Enforce RBAC at the API layer; never trust frontend role checks alone.
- Serverside guards (`admin/owner/worker-guard.ts`) + audit every mutation.
- Workers/Resellers never receive full customer payment data in API responses.
- Log every role/permission change and every price/discount override.
- Per-reseller price floors so resellers can't undercut brand pricing; rate-limit referral links.
- Owner grants/revokes are audited (who, whom, what, when, why).
- 2FA recommended for OWNER and ADMIN accounts.
- No secrets in frontend; `NEXT_PUBLIC_` only for public keys.

---

*This is the working blueprint. Each section can be expanded into a deeper spec (UI wireframe,
schemas, API shapes) on request.*
