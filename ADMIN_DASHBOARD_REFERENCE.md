# Admin Dashboard — Reference Guide

> Source of truth: the deployed `/admin` at `headerr-store.vercel.app/admin`, built from this
> repo (`src/app/admin/*`). The panel is auth-gated (ADMIN role only); this reference documents
> every page, control, table, dialog, and API call it exposes.

---

## Access & Guarding

- URL: `/admin` (+ subpages below)
- Access: `ADMIN` role only.
- Gate: `src/app/admin/layout.tsx` — no session → redirect to `/auth/signin?callbackUrl=/admin`; role ≠ ADMIN → redirect to `/`.
- All API mutations are authenticated server-side via `getAdminUser()` (session + role check) and written to the **audit log** (`logAudit()`).

## Navigation (sidebar)

Desktop: `w-64` left sidebar. Mobile (<md): hamburger top bar + dropdown.

| Link | Icon | Active rule |
|------|------|-------------|
| Dashboard | LayoutDashboard | exact `/admin` |
| Products | Package | prefix |
| Orders | ShoppingCart | prefix |
| Users | Users | prefix |
| Owners | Building2 | prefix |
| Workers | HardHat | prefix |
| Categories | FolderTree | prefix |
| Audit Log | ScrollText | prefix |
| Settings | Settings | prefix |

Footer shows signed-in user name + email and a **Sign out** button (Supabase signOut → `/`).

---

## Dashboard (`/admin`)

**API:** `GET /api/admin/stats`

**Stat cards** (responsive 2/3-col, each links to its section):

| Card | Shows | Links to |
|------|-------|----------|
| Users | user count | `/admin/users` |
| Owners | owner count | `/admin/owners` |
| Products | product count | `/admin/products` |
| Orders | order count | `/admin/orders` |
| Revenue | formatted total | `/admin/orders` |
| Audit events | audit count | `/admin/audit` |

**Recent orders table**
Columns: Order (number), Customer, Total, Status (color-coded badge), Date.

Status badge colors: PENDING yellow / PROCESSING blue / SHIPPED purple / DELIVERED green / CANCELLED red / REFUNDED gray.

Empty → "No orders yet." Loading → skeleton.

---

## Users (`/admin/users`)

**API:** `GET /api/admin/users?page=&size=&role=&search=` · `PATCH /api/admin/users`

**Controls:** Role filter dropdown (All / CUSTOMER / OWNER / WORKER / ADMIN) · Search box. Reset to page 1 on change.

**Table columns:** Name, Email, Role (badge + inline dropdown), Vendor (store + status, or —), Joined (date).

Role badge colors: ADMIN red / OWNER blue / WORKER purple / CUSTOMER gray.

**Inline role change:** each row has a role `<Select>` that fires `PATCH { userId, role }` immediately, reloads on success.

**Pagination:** 20/page; "Page X of Y · N users" + prev/next (`ChevronLeft/Right`), disabled at bounds.
Empty → "No users found." No create/delete.

---

## Owners (`/admin/owners`)

**API:** `GET /api/admin/owners?status=` · `PATCH /api/admin/owners`

**Controls:** Status filter (All / PENDING / APPROVED / SUSPENDED). No search, no pagination.

**Table columns:** Store (+ /slug), Owner (name + email), Commission (%), Products (count), Status (badge + inline dropdown).

Status badge colors: PENDING yellow / APPROVED green / SUSPENDED red.

**Inline status change:** `<Select>` fires `PATCH { vendorId, status }`, reloads.
Empty → "No owners found."

---

## Workers (`/admin/workers`)

**API:** `GET /api/admin/workers?search=`

**Controls:** Search box only. **Read-only table** — no edit/delete.

**Table columns:** Name, Email, Owner, Tasks (count), Status (badge).
Status badge: ACTIVE green / else gray.
Empty → "No workers found." No pagination.

---

## Products (`/admin/products`)

**API:**
- `GET /api/admin/products?page=&size=&search=`
- `GET /api/admin/categories` (dialog dropdown)
- `POST /api/admin/products`
- `PATCH /api/admin/products/{id}`
- `DELETE /api/admin/products/{id}`

**Controls:** Search box · **"Add product"** button (opens dialog).

**Table columns:** Product (40×40 thumbnail, name, Featured badge, "{n} sizes"), Category, Store, Price (formatted), Status (Published green / Draft gray), Actions (Edit `Pencil`, Delete `Trash2` red).

**Delete:** `window.confirm` then DELETE.
**Pagination:** 20/page. Empty → "No products found."

### Product dialog (create + edit)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | text | Yes | |
| Base price | number | Yes | |
| Compare price | number | No | |
| Category | select | Yes (create only) | hidden when editing |
| Vendor ID | text | Yes (create only) | hidden when editing |
| Team | text | No | |
| Season | text | No | |
| Player | text | No | |
| Brand | text | No | |
| Description | textarea | No | |
| Published | checkbox | No | |
| Featured | checkbox | No | |

Buttons: Cancel / Create (or Save changes).

---

## Orders (`/admin/orders`)

**API:** `GET /api/admin/orders?page=&size=&status=&search=` · `PATCH /api/admin/orders`

**Controls:** Status filter (All / PENDING / PROCESSING / SHIPPED / DELIVERED / CANCELLED / REFUNDED) · Search "Search order #…". Reset page on change.

**Table columns:** Order (number), Customer, Items (count), Total (formatted), Status (inline dropdown), Payment (badge), Date.

**Inline status change:** `<Select>` fires `PATCH { orderId, status }`, reloads.

Payment badge colors: PENDING yellow / PAID green / FAILED red / REFUNDED gray (read-only).

**Pagination:** 20/page. Empty → "No orders found." No create/delete/refund actions.

---

## Categories (`/admin/categories`)

**API:** `GET /api/admin/categories` · `POST /api/admin/categories` · `PATCH /api/admin/categories/{id}` · `DELETE /api/admin/categories/{id}`

**Controls:** **"Add category"** button. No search/filter/pagination.

**Table columns:** Name, Slug, Products (count), Description (or —), Actions (Edit / Delete).
Delete = `window.confirm` then DELETE. Empty → "No categories yet."

### Category dialog
| Field | Type | Required |
|-------|------|----------|
| Name | text | Yes |
| Description | textarea | No |

---

## Audit Log (`/admin/audit`)

**API:** `GET /api/admin/audit?page=&size=&search=` — **read-only**, no mutations.

**Controls:** Search box ("Search audit…").

**Table columns:** Action (color-coded badge), Actor (email), Role, Resource (+ truncated id), Result, Time (date+time).

Action badge colors: sample set — product.create / categories.create green, order.update / categories.update blue, settings.update purple, users.update orange, owners.update cyan, categories.delete red; unknown falls back to gray.

**Pagination:** 20/page. Empty → "No audit entries."

---

## Settings (`/admin/settings`)

**API:** `GET /api/admin/settings` · `PATCH /api/admin/settings`

**Layout:** Single "Store settings" card (`max-w-2xl`).

| Field | Label | Type |
|-------|-------|------|
| `siteName` | Site name | text |
| `currency` | Currency | text |
| `taxRate` | Tax rate (e.g. 0.18) | number |
| `shippingFee` | Shipping fee | number |
| `freeShippingThreshold` | Free shipping over | number |

All fields optional; empty fields are omitted from the PATCH body. **Save settings** button disables + shows "Saving…" while in flight.

---

## Full API Endpoint Map

| Method | Endpoint | Page |
|--------|----------|------|
| GET | `/api/admin/stats` | Dashboard |
| GET | `/api/admin/users` | Users |
| PATCH | `/api/admin/users` | Users (role) |
| GET | `/api/admin/owners` | Owners |
| PATCH | `/api/admin/owners` | Owners (status) |
| GET | `/api/admin/workers` | Workers |
| GET | `/api/admin/products` | Products |
| POST | `/api/admin/products` | Products (create) |
| PATCH | `/api/admin/products/{id}` | Products (edit) |
| DELETE | `/api/admin/products/{id}` | Products (delete) |
| GET | `/api/admin/categories` | Products + Categories |
| POST | `/api/admin/categories` | Categories |
| PATCH | `/api/admin/categories/{id}` | Categories |
| DELETE | `/api/admin/categories/{id}` | Categories |
| GET | `/api/admin/orders` | Orders |
| PATCH | `/api/admin/orders` | Orders (status) |
| GET | `/api/admin/audit` | Audit Log |
| GET | `/api/admin/settings` | Settings |
| PATCH | `/api/admin/settings` | Settings |

## Shared UI Patterns

- **Search**: `<form onSubmit>`; `search` state (live) vs `query` (committed); resets page to 1.
- **Pagination**: shared on Users/Products/Orders/Audit; 20/page; prev/next arrows.
- **Loading**: `skeleton` placeholder divs.
- **Feedback**: `sonner` `toast.success/error` on all mutations.
- **Confirm before delete**: `window.confirm` (Products, Categories only).
- **Inline selectors**: Users (role), Owners (status), Orders (status) — immediate PATCH, no modal.
