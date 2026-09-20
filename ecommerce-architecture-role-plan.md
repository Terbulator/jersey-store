# E-Commerce Platform — Architecture & Role-Based Implementation Plan

## 1. High-Level System Architecture

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

**Suggested stack**
- Frontend: React/Next.js (storefront), React/Vue admin SPA
- Backend: Node.js (NestJS) or Django/Laravel — microservices or a well-modularized monolith to start
- Database: PostgreSQL (primary), Redis (cache/sessions), Elasticsearch (search)
- Auth: JWT + refresh tokens, RBAC/ABAC middleware
- Storage: S3-compatible for product images/invoices
- Payments: Stripe/Razorpay/PayPal integration layer
- Queue: RabbitMQ/Kafka for order events, stock sync, notifications
- Hosting: Docker + Kubernetes (or simpler PaaS for early stage)

---

## 2. Role Hierarchy

```
        Owner  (full control, business-level)
          │
        Admin  (operational control, no billing/ownership rights)
          │
        Worker  (task execution: fulfillment, support, inventory)

        Reseller  (external partner — sells platform products under own margin, sits outside internal hierarchy but scoped like Worker)
```

- **Owner** — 1 or few per store. Ultimate authority: finances, staff, store settings, integrations.
- **Admin** — appointed by Owner. Runs daily operations, manages catalog, orders, staff (except Owner).
- **Worker** — staff with narrow, task-specific access (e.g., packing, support, stock entry).
- **Reseller** — external/semi-external partner who resells products at their own price, with visibility limited to their own sales/commission.

---

## 3. Role → Permission Matrix

| Module | Owner | Admin | Worker | Reseller |
|---|---|---|---|---|
| Store settings (domain, branding, payment gateway keys) | Full | View only | ❌ | ❌ |
| Financial reports (revenue, profit, payouts) | Full | Partial (no profit margin) | ❌ | Own earnings only |
| User & role management | Full (all roles) | Manage Workers only | ❌ | ❌ |
| Product catalog (create/edit/delete) | Full | Full | Edit stock/desc only (assigned category) | View only (or "request listing") |
| Pricing control | Full | Full (within policy) | ❌ | Set resale price within Owner-defined floor/ceiling |
| Inventory management | Full | Full | Update stock counts, receive goods | View own allocated stock (if drop-ship model) |
| Orders — view | All | All | Assigned/queue only | Own orders only |
| Orders — process (pack/ship/refund) | Full | Full | Process assigned orders | Cannot process; can request refund |
| Customer data | Full | Full | Limited (name, order, address — no payment info) | Only their own customers |
| Discounts/Coupons | Full | Create/manage | ❌ | Apply only pre-approved reseller coupons |
| Payment gateway/payout config | Full | ❌ | ❌ | View own payout status |
| Marketing (campaigns, banners) | Full | Full | ❌ | Own storefront/link promotion only |
| Analytics dashboard | Full store-wide | Full store-wide | Own task metrics | Own sales metrics |
| Commission/payout management | Full | View | ❌ | View own |
| Support tickets | Full | Full | Assigned tickets | Own customer tickets |
| Audit logs | Full | Partial (own team) | ❌ | ❌ |

Implement this as a **permission table in DB**, not hardcoded — so Owner can fine-tune per staff member later (RBAC with optional per-user overrides).

---

## 4. Core Modules Every E-Commerce Store Needs

1. **Product Catalog** — categories, variants (size/color), SKU, media, SEO fields, bundles
2. **Inventory Management** — stock levels, low-stock alerts, multi-warehouse support, reservation on cart-add
3. **Order Management** — cart, checkout, order status lifecycle (Pending → Confirmed → Packed → Shipped → Delivered → Returned/Refunded)
4. **Payments** — gateway integration, wallets, COD handling, refunds, invoices
5. **Shipping/Logistics** — courier integration, tracking, rate calculation, label generation
6. **Customer Management (CRM)** — profiles, order history, support tickets, loyalty points
7. **Pricing & Promotions** — coupons, flash sales, tiered/reseller pricing
8. **Reseller/Affiliate Engine** — unique referral links/codes, commission calculation, payout tracking
9. **Notifications** — order updates via email/SMS/push, internal task alerts
10. **Analytics & Reporting** — sales, traffic, staff performance, reseller performance
11. **Staff/Task Management** — task assignment, shift tracking, performance
12. **Content/Marketing** — banners, blog/SEO pages, email campaigns
13. **Security & Audit** — login logs, role change logs, activity trail
14. **Settings/Configuration** — tax rules, currency, payment/shipping methods, store policies

---

## 5. Dashboard Design Per Role

### 5.1 Owner Dashboard
**Goal: full visibility + strategic control**
- Overview: revenue, profit margin, orders today/week/month, top products, growth charts
- Staff management: add/remove Admins, Workers, Resellers; assign permissions
- Financials: payout history, gateway settlement, tax reports, expense tracking
- Store settings: domain, branding, payment/shipping provider keys, policies
- Reseller program config: commission tiers, price floors/ceilings, approval of new resellers
- Full audit log viewer
- Integrations: marketing tools, ERP, accounting software

### 5.2 Admin Dashboard
**Goal: run daily operations smoothly**
- Orders queue: all orders, filter/assign to Workers, bulk actions
- Catalog management: add/edit products, manage categories, stock levels
- Discount/coupon creation
- Customer support queue
- Staff (Worker) task assignment and performance view
- Sales reports (without profit-margin/cost data unless Owner grants it)
- Reseller applications review (approve/reject, forward to Owner if needed)

### 5.3 Worker Dashboard
**Goal: focused task execution, minimal noise**
- "My Tasks" queue: assigned orders to pack/ship, tickets to resolve, stock to count
- Order detail view with pack/ship/mark-complete actions
- Stock update form (barcode/SKU scan-friendly)
- Simple performance view: tasks completed today/week
- Internal messaging/notes with Admin

### 5.4 Reseller Dashboard
**Goal: self-service selling + earnings tracking**
- Product catalog available for resale (with base cost and suggested resale range)
- "My Store" — reseller's storefront link/branding (if white-label supported)
- Orders placed through their link/code
- Commission/earnings tracker + payout history + payout request
- Marketing assets (banners, product images, referral link generator)
- Support: request stock, raise issue about an order

---

## 6. Database Schema (Core Entities — simplified)

```
users (id, name, email, password_hash, role_id, status, created_at)
roles (id, name, description)
permissions (id, module, action)
role_permissions (role_id, permission_id)
user_permission_overrides (user_id, permission_id, allow/deny)   -- for fine-tuning

products (id, name, sku, category_id, description, base_price, cost_price, owner_id)
product_variants (id, product_id, attributes JSON, stock_qty, price)
categories (id, name, parent_id)

orders (id, customer_id, reseller_id NULLABLE, status, total, payment_status, created_at)
order_items (id, order_id, product_variant_id, qty, price)
order_assignments (id, order_id, worker_id, task_type, status)

resellers (id, user_id, commission_rate, price_floor, price_ceiling, payout_method)
reseller_sales (id, reseller_id, order_id, commission_earned, payout_status)

payments (id, order_id, gateway, amount, status, transaction_ref)
shipments (id, order_id, courier, tracking_no, status)

audit_logs (id, user_id, action, module, target_id, timestamp)
```

---

## 7. Implementation Plan (Phased)

**Phase 1 — Foundation (Weeks 1–3)**
- Set up infra (repo, CI/CD, DB, hosting)
- Build Auth service + RBAC (roles, permissions table, JWT)
- Build user management (Owner creates Admin/Worker/Reseller accounts)

**Phase 2 — Core Commerce (Weeks 3–6)**
- Product catalog + inventory service
- Cart + checkout + order lifecycle
- Payment gateway integration

**Phase 3 — Role Dashboards (Weeks 6–9)**
- Owner dashboard (financials, staff mgmt, settings)
- Admin dashboard (orders, catalog, staff tasks)
- Worker dashboard (task queue, order fulfillment)
- Reseller dashboard (catalog access, referral links, earnings)

**Phase 4 — Operations Layer (Weeks 9–11)**
- Shipping/courier integration
- Notifications (email/SMS/push)
- Support ticket system

**Phase 5 — Reseller/Affiliate Engine (Weeks 11–13)**
- Commission engine, payout automation
- Reseller storefront/link generation
- Reseller onboarding + approval flow

**Phase 6 — Analytics, Hardening, Launch (Weeks 13–16)**
- Reporting dashboards per role
- Audit logging, security review, load testing
- Staging → UAT → production rollout

---

## 8. Security & Governance Notes
- Enforce RBAC at API layer, never trust frontend role checks alone
- Separate read scopes carefully: Workers/Resellers should never receive full customer payment data in API responses
- Log every role/permission change and every price/discount override (audit trail)
- Use per-reseller price floors so resellers can't undercut brand pricing
- Rate-limit and monitor reseller-generated links to prevent abuse/fraud
- 2FA recommended for Owner and Admin accounts

---

This document can serve as your working blueprint — happy to turn any single section (e.g., the DB schema, or one dashboard's wireframe/UI) into a deeper spec or an actual working prototype next.
