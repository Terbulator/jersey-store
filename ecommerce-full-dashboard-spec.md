# E-Commerce Platform — Complete Dashboard Specification
## Every Feature, Every Limitation, Every Unlock Control (Owner / Admin / Worker / Reseller)

This document expands the architecture into a full operational spec — as if written by the store owner defining exactly what each role can touch, what they can't, and how limits can be lifted.

---

## 0. The Core Principle: "Locked by Default, Unlockable by Owner"

Every permission in this system exists in **three states**:

| State | Meaning |
|---|---|
| 🟢 **Open** | Role has this by default |
| 🔴 **Locked** | Role cannot do this by default |
| 🟡 **Unlockable** | Locked by default, but Owner can grant it — either permanently, temporarily (time-boxed), or per-instance (one-time approval) |

**Owner Permission Console** (a dedicated screen) lists every 🟡 item across every role and every individual staff member, with three grant modes:
1. **Permanent unlock** — toggle stays on until Owner reverts it
2. **Temporary unlock** — auto-expires after X hours/days (e.g., "Allow Worker John to approve refunds for 24 hours")
3. **One-time approval** — a single pending action (e.g., a specific refund) gets approved once, permission doesn't persist

Every unlock/lock action is written to the **Audit Log** with timestamp, who granted it, to whom, and why (optional reason field).

---

## 1. OWNER PANEL — Full Feature List

### 1.1 Dashboard / Command Center
- Real-time revenue counter (today/week/month/year, comparison to previous period)
- Net profit view (revenue − COGS − fees − refunds − payouts)
- Order volume graph, conversion rate, average order value (AOV)
- Live order feed (ticker of incoming orders)
- Alerts panel: low stock, failed payments, pending refund requests, reseller payout requests, staff permission requests
- Top performers: best-selling products, best Worker (task speed), best Reseller (sales)
- Quick actions: create product, add staff, broadcast announcement, view today's P&L

### 1.2 Financial Control Center
- Full P&L statement (auto-generated, exportable to accounting formats)
- Revenue breakdown by channel (direct store, reseller-driven, marketplace if applicable)
- Cost tracking: COGS, shipping cost, gateway fees, ad spend (if integrated), staff payroll (optional module)
- Tax configuration: tax classes, region-based tax rules, GST/VAT invoice settings
- Payment gateway management: connect/disconnect Stripe/Razorpay/PayPal/etc., set primary/fallback gateway, view settlement reports
- Payout management: Reseller payouts, refund approvals above a threshold, bulk payout runs
- Currency & multi-currency settings, exchange rate source
- Expense log (manual entries: rent, utilities, ads, misc.)
- Financial access control: decide which numbers Admin can see (toggle: hide cost price / hide profit margin / hide gateway fees from Admin view)

### 1.3 Staff & Role Management
- Create/edit/suspend/delete: Admin, Worker, Reseller accounts
- Assign role + custom permission overrides per individual (not just role-level)
- **Owner Permission Console** (see Section 0) — grant/revoke unlocks
- Staff activity log: login times, actions taken, session duration
- Shift/attendance tracking (optional, for Workers)
- Payroll module (optional): salary/hourly rate, commission-based pay, payslip generation
- Department/team grouping (e.g., "Packing Team", "Support Team")
- Impersonate/"View as" mode — Owner can preview what an Admin/Worker/Reseller sees, for troubleshooting

### 1.4 Catalog & Inventory (Full Control)
- Full CRUD on products, variants, categories, collections, bundles
- Bulk import/export (CSV/Excel), bulk price update, bulk stock update
- Multi-warehouse setup, stock transfer between warehouses
- Supplier/vendor management, purchase orders
- Cost price entry (hidden from lower roles unless unlocked)
- Product approval workflow toggle (e.g., require Owner/Admin approval before a Worker-added product goes live)
- SEO fields, structured data, product page customization

### 1.5 Order & Fulfillment Oversight
- View/manage all orders regardless of assignment
- Override any order status manually
- Refund/cancellation approval queue (set auto-approve threshold, e.g., auto-approve refunds under $20)
- Dispute/chargeback management
- Return merchandise authorization (RMA) rules

### 1.6 Pricing, Promotions & Reseller Program
- Global pricing rules, bulk discount campaigns, flash sales
- Coupon engine: create, set usage limits, stacking rules
- **Reseller Program Configuration**:
  - Commission tiers (flat %, tiered by volume, per-category rates)
  - Price floor/ceiling per product (minimum/maximum resale price)
  - Reseller approval workflow (auto-approve vs manual review)
  - White-label storefront toggle (allow reseller's own branding/subdomain)
  - Reseller-specific coupon issuance limits

### 1.7 Marketing & Content
- Homepage/banner management, landing page builder
- Email/SMS campaign builder + automation (abandoned cart, win-back, etc.)
- Blog/CMS pages, SEO settings sitewide
- Loyalty/rewards program configuration
- Affiliate/referral program (separate from reseller program, if wanted)
- Integration hub: Google Ads, Meta Pixel, Analytics, CRM, ERP, accounting software

### 1.8 Store Settings & Configuration
- Store identity: name, logo, domain, favicon, theme
- Shipping settings: zones, rates, carrier integrations, free-shipping thresholds
- Payment method availability (COD on/off, wallet, BNPL, etc.)
- Legal pages: privacy policy, T&C, return policy templates
- Notification templates (email/SMS wording) for all order states
- API keys & webhook management
- Backup & data export, GDPR/data-deletion request handling

### 1.9 Analytics & Reporting
- Full sales, traffic, funnel, and cohort analytics
- Staff performance reports (Worker task completion rate, Admin order-processing time)
- Reseller performance leaderboard
- Customer lifetime value (LTV), churn, repeat-purchase rate
- Custom report builder + scheduled email reports

### 1.10 Security & Compliance
- Full audit log (every action, every role, filterable/searchable/exportable)
- 2FA enforcement policy (mandate for Admin/Owner)
- IP allowlisting for admin panel access
- Session management: force logout, active session viewer
- Data retention & compliance settings (PCI-DSS notes, GDPR consent logs)

### 1.11 System / "Macro" Controls (marketplace-level, store-wide switches)
- **Maintenance mode** toggle (whole store or specific sections)
- **Feature flags**: enable/disable modules platform-wide (e.g., turn off reseller program entirely, disable COD temporarily)
- **Global kill-switch** for a payment gateway, a courier, or a specific integration if it's malfunctioning
- **Multi-store/multi-brand management** (if Owner runs more than one storefront from one backend)
- **Rate limiting / fraud rules**: max orders per customer/hour, flag suspicious reseller activity, auto-block abusive IPs
- **Currency/locale rollout control**: enable new country/language storefronts
- **Version/release control**: staging vs production toggle for testing new features before go-live
- **Global announcement banner** (site-wide message, e.g., "Sale ends tonight" or "Delayed shipping due to holiday")
- **Emergency broadcast** to all staff dashboards (e.g., "Warehouse closed today")

---

## 2. ADMIN PANEL — Features, Limitations & Unlocks

### 2.1 What Admin Can Do by Default (🟢 Open)
- Full order management: view, assign, process, ship, mark complete
- Full catalog CRUD (add/edit/delete products, categories, stock)
- Create and manage discounts/coupons (within Owner-set max discount %)
- Manage Worker accounts: create, assign tasks, view performance
- Manage customer support tickets, issue refunds **below Owner-set threshold**
- View sales/traffic reports (numbers only, not cost/profit unless unlocked)
- Approve/reject Reseller applications (final approval may route to Owner depending on config)
- Send customer notifications, run basic email campaigns
- Configure shipping rates within existing carrier setup

### 2.2 What Admin Cannot Do by Default (🔴 Locked)
- Cannot see cost price / profit margin / gateway settlement details
- Cannot change payment gateway keys or add/remove gateways
- Cannot create or delete Admin or Owner accounts
- Cannot change global store settings (domain, legal pages, tax rules)
- Cannot approve refunds/discounts above the Owner-set ceiling
- Cannot access payroll or reseller commission-rate configuration
- Cannot enable/disable platform-wide feature flags or maintenance mode
- Cannot export full financial reports (P&L) — only sales summaries
- Cannot modify reseller price floor/ceiling

### 2.3 Unlockable for Admin (🟡)
| Feature | Unlock type available |
|---|---|
| View cost price / margin | Permanent toggle per Admin |
| Approve refunds above threshold | Temporary (e.g., "for this week") or one-time |
| Edit reseller commission tiers | Permanent, per Admin |
| Create/suspend other Admin accounts | Permanent (rare — "co-owner" style trust) |
| Access full P&L export | Permanent or scheduled (e.g., monthly only) |
| Change shipping carrier integrations | Permanent |
| Push site-wide announcement banner | One-time per use |

**Admin Dashboard additions to reflect this:** a "Request Access" button next to every locked feature — sends a notification to Owner with one-click Approve/Deny, instead of Admin having to ask outside the system.

---

## 3. WORKER PANEL — Features, Limitations & Unlocks

Workers are typically scoped **per department** (Fulfillment, Support, Inventory, Content) — the dashboard should have department-based views. Below is the combined superset; a real deployment shows only relevant sections per Worker's department.

### 3.1 What Worker Can Do by Default (🟢 Open)
- View "My Tasks" queue (assigned orders/tickets/stock jobs only)
- Update order status for assigned orders (Packed → Shipped)
- Print packing slip / shipping label for assigned orders
- Update stock count for assigned SKUs (receiving goods, cycle counts)
- Respond to assigned support tickets (using pre-approved macros/templates)
- Add internal notes to an order (visible to Admin/Owner)
- Clock in/out (if attendance tracking enabled)
- View own performance stats (tasks/day, average handling time)

### 3.2 What Worker Cannot Do by Default (🔴 Locked)
- Cannot view orders/tickets not assigned to them
- Cannot see customer payment details (card/wallet info) — only shipping info
- Cannot edit product price or create/delete products
- Cannot issue refunds or cancel orders
- Cannot apply/create discount coupons
- Cannot view store-wide sales numbers or other staff's performance
- Cannot message customers outside pre-approved templates (prevents off-brand/rogue communication)
- Cannot see reseller data at all

### 3.3 Unlockable for Worker (🟡)
| Feature | Unlock type available |
|---|---|
| Edit product description/images (not price) | Permanent, per category assigned |
| Issue refund up to small cap (e.g., $10) | Permanent or temporary |
| View team-wide task queue (not just own) | Permanent — for "lead" Workers |
| Free-text customer messaging (no template lock) | Permanent, per trusted Worker |
| View basic store sales dashboard (numbers only) | Temporary, e.g. during a specific campaign |

---

## 4. RESELLER PANEL — Features, Limitations & Unlocks

### 4.1 What Reseller Can Do by Default (🟢 Open)
- Browse approved catalog available for resale, with base/wholesale cost shown
- Set own resale price **within Owner-defined floor/ceiling**
- Get unique referral link / coupon code / (optionally) white-label mini-storefront
- View own orders, own customers (name/order/shipping — no platform-wide customer data)
- View own commission ledger: earned, pending, paid
- Request payout (subject to Owner-set minimum payout amount and schedule)
- Download marketing assets (images, banners, descriptions)
- Raise support requests to Admin (stock request, order issue, payout issue)

### 4.2 What Reseller Cannot Do by Default (🔴 Locked)
- Cannot see other resellers' sales or the store's overall performance
- Cannot see actual product cost price beyond the wholesale rate shown to them
- Cannot set price outside the floor/ceiling
- Cannot access customer payment/card details
- Cannot create discount coupons independently (can only apply Owner-issued reseller coupons)
- Cannot list new products themselves without approval
- Cannot process own refunds — must request via Admin
- Cannot access inventory levels beyond "in stock / low stock / out of stock" flags

### 4.3 Unlockable for Reseller (🟡)
| Feature | Unlock type available |
|---|---|
| Wider price flexibility (higher ceiling / lower floor) | Permanent, per reseller tier |
| Self-list new products (pending Admin approval) | Permanent |
| Full white-label storefront (custom domain/branding) | Permanent, for top-tier resellers |
| Direct refund initiation (auto-approved under cap) | Temporary or permanent |
| Access to exact stock counts (not just flags) | Permanent, for high-volume resellers |
| Custom coupon creation within a discount cap | Permanent, per reseller tier |

**Reseller tier system** (recommended): Bronze / Silver / Gold / Platinum — each tier auto-applies a bundle of the unlocks above, and Owner can promote/demote a reseller's tier from the Owner Permission Console, instead of toggling each unlock manually every time.

---

## 5. The Owner Permission Console — UI Spec

A dedicated screen under Owner Panel → **Staff → Permissions**:

- **Left panel**: list of all staff (Admins, Workers, Resellers), searchable/filterable by role, department, or tier
- **Center panel**: selected user's full permission list, grouped by module, each row showing:
  - Current state (🟢/🔴/🟡-granted)
  - Toggle switch
  - Grant-type selector (Permanent / Temporary [date picker] / One-time)
  - "Reason" text field (optional, logged)
- **Right panel**: pending access requests (from Admin/Worker/Reseller "Request Access" buttons) — Approve / Deny with one click
- **Bottom**: full audit trail for the selected user (every grant/revoke, timestamped, with who did it)

**Bulk actions**: apply a permission bundle (a "role template" or "tier") to multiple users at once instead of one-by-one.

**Notification hooks**: whenever a permission is granted/revoked/expiring soon, the affected user gets an in-dashboard + email notification.

---

## 6. Cross-Cutting "Macro"/Marketplace-Level Controls (Owner-Only, System-Wide)

These sit above individual role permissions — they control the platform itself:

1. **Global Feature Flags** — turn entire modules on/off store-wide (reseller program, loyalty program, COD, guest checkout, reviews, wishlists)
2. **Maintenance Mode** — full store or section-specific (e.g., checkout-only maintenance during gateway migration)
3. **Fraud & Risk Engine** — velocity checks, blacklist/allowlist IPs or emails, manual review queue for high-risk orders
4. **Multi-Store/Multi-Brand Switch** — manage several storefronts from one Owner login, each with its own Admin/Worker/Reseller sets
5. **Locale & Currency Rollout** — enable new country, language, currency pack
6. **Compliance Controls** — GDPR consent logging, cookie policy toggle, data-deletion request handling, PCI compliance mode
7. **API & Webhook Governance** — issue/revoke API keys, rate-limit external integrations, sandbox vs production mode
8. **Backup & Disaster Recovery** — manual/auto backup schedule, restore points, export full data dump
9. **System Health Monitor** — server load, error rates, failed webhook deliveries, third-party integration status (payment gateway uptime, courier API status)
10. **Version/Release Control** — push new features to a staging environment before going live; rollback switch
11. **Global Announcement / Emergency Broadcast** — push a message to all dashboards or the live storefront instantly

---

## 7. Summary Table — Default Access at a Glance

| Capability | Owner | Admin | Worker | Reseller |
|---|---|---|---|---|
| Store settings & gateway keys | 🟢 | 🔴🟡 | 🔴 | 🔴 |
| Full financial/profit reports | 🟢 | 🔴🟡 | 🔴 | 🔴 (own earnings only 🟢) |
| Staff/role management | 🟢 | Worker only 🟢, others 🔴🟡 | 🔴 | 🔴 |
| Product create/edit/delete | 🟢 | 🟢 | Partial 🟢 / 🔴🟡 for full | 🔴🟡 (self-list) |
| Pricing control | 🟢 | 🟢 (within cap) | 🔴 | 🟢 (within floor/ceiling) 🔴🟡 (beyond) |
| Order processing | 🟢 all | 🟢 all | 🟢 assigned only | View own only |
| Refunds | 🟢 unlimited | 🟢 under cap, 🔴🟡 above | 🔴🟡 small cap | 🔴🟡 request only |
| Discounts/coupons | 🟢 | 🟢 within cap | 🔴 | Owner-issued only, 🔴🟡 own |
| Platform feature flags/maintenance | 🟢 | 🔴 | 🔴 | 🔴 |
| Audit logs | 🟢 full | 🔴🟡 own team | 🔴 | 🔴 |

---

This spec is designed so **nothing is a hard wall** except true business-critical controls (gateway keys, account creation for Admin/Owner tier, platform-wide switches) — everything else is a locked door the Owner holds the key to, unlockable permanently, temporarily, or one-time, all logged.

Next step I'd recommend: turn Section 5 (Permission Console) and the Summary Table into actual clickable wireframes, or convert this into a formal PRD (Product Requirements Document) per role for your dev team.
