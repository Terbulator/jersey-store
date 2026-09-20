# Jersey Store — 3D E-Commerce Platform

Premium retro and current football jersey e-commerce platform with **interactive 3D product previews**.

> **Note on accuracy:** this README reflects the **actual, current state** of the code in this repository, not the aspirational roadmap. Several features described in older doc versions (Admin panel, vendor dashboard, Sanity CMS integration, DB-backed product catalog, Rollup/OAuth) are **not yet implemented** — they are called out explicitly as planned/unused below.

---

## 📑 Table of Contents

1. [Features](#-features)
2. [What's Built vs. What's Planned](#-whats-built-vs-whats-planned)
3. [Tech Stack](#-tech-stack)
4. [Architecture & Flow](#-architecture--flow)
5. [Project Structure](#-project-structure)
6. [Data Sources: Static Products vs. Database](#-data-sources-static-products-vs-database)
7. [Auth Flow](#-auth-flow)
8. [Checkout & Payment Flow](#-checkout--payment-flow)
9. [Cart & Wishlist Flow (Client State)](#-cart--wishlist-flow-client-state)
10. [3D Rendering](#-3d-rendering)
11. [Routing Map](#-routing-map)
12. [Quick Start](#-quick-start)
13. [Default Credentials](#-default-credentials-after-seeding)
14. [Scripts](#-scripts)

---

## ✨ Features

- **🛍️ Product Catalog**: Static catalog driven by `src/lib/products.ts`, browsable by category and searchable.
- **🎮 3D Product Viewer**: React Three Fiber + Drei + Three.js with color variants, auto-rotation, and orbit controls.
- **🌟 Hero 3D Scene**: Animated floating jerseys on the homepage with WebGL detection + graceful fallback.
- **🛒 Cart**: Client-side Zustand store with `localStorage` persistence and a slide-out drawer.
- **❤️ Wishlist**: Client-side persisted store (product IDs), real add/remove + dedicated account page.
- **🔐 Authentication**: NextAuth.js (v4) with **Credentials** (email + password, bcrypt) and JWT sessions.
- **💳 Payments**: Stripe PaymentIntent (INR), with a working demo fallback path when Stripe isn't configured.
- **🌓 Dark Mode**: `next-themes` theme switcher.
- **📱 Fully Responsive**: Mobile-first design with a mobile nav menu.
- **🏷️ Static Reading Pages**: Privacy, Terms, Shipping, Returns, Cookies, Contact, Help.

---

## 🔍 What's Built vs. What's Planned

| Capability | Status | Where / Notes |
|-----------|--------|----------------|
| Static product catalog | ✅ Built | `src/lib/products.ts` |
| 3D viewer + hero scene | ✅ Built | `src/components/3d/` |
| Client cart + wishlist | ✅ Built | `src/store/` |
| Credentials auth (JWT) | ✅ Built | `src/lib/auth.ts` |
| Stripe PaymentIntent checkout | ✅ Built | `src/app/api/checkout/`, `src/app/checkout/` |
| Order persistence in DB | ✅ Built (demo mode) | `src/app/api/create-order/` |
| Vendor application form | ✅ Built (form only) | `src/app/vendor/apply/` |
| **Admin panel** | ❌ Not built | Node `/admin` does **not** exist. Only an admin role + seeded admin user exist in the schema/sign-in page. |
| **Vendor dashboard** | ❌ Not built | Only the `/vendor/apply` application form; no dashboard |
| **OAuth (Google / GitHub)** | ❌ Not wired | Deps absent; `auth.ts` only uses CredentialsProvider |
| **Sanity CMS** | ❌ Unused | `src/lib/sanity.ts` + `@sanity/*` deps exist but are **imported nowhere** |
| **DB-backed product catalog** | ❌ Unused | Products come from static file; Prisma `Product`/`Category` tables are not the display source |
| **DB-backed cart / wishlist** | ❌ Unused | Both are client-side Zustand; DB `CartItem`/`WishlistItem` models are unused |
| **Multi-vendor / Stripe Connect** | ❌ Schema only | `Vendor`/`Payout`/`role` models exist; no runtime logic |
| **TanStack Query** | ❌ Unused | Provider wraps app but no `useQuery`/`useMutation` calls exist |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| 3D Engine | React Three Fiber + Drei + Three.js |
| Styling | Tailwind CSS + shadcn/ui-style primitives |
| Client State | Zustand (persisted) |
| Database | PostgreSQL + Prisma (used for **auth + orders**; products are static) |
| Auth | NextAuth.js v4 (Credentials, JWT) |
| Payments | Stripe (PaymentIntent, INR) |
| Animation | Framer Motion |
| Icons | Lucide React |
| Forms/Validation (declared) | react-hook-form + zod (currently **unused**) |

---

## 🏗️ Architecture & Flow

```
                        ┌──────────────────────────────────────────┐
                        │            BROWSER (Client)              │
                        │  React 18 + Next App Router + Zustand    │
                        └───────────────────┬──────────────────────┘
                                            │
                          ┌─────────────────┼──────────────────────┐
                          │                 │                      │
              ┌───────────▼───────┐ ┌──────▼─────────┐ ┌──────────▼─────────┐
              │  Server Components │ │ Client Hooks    │ │  Client Stores     │
              │  (RSC/SSR pages)   │ │ useSession,     │ │  useCart,          │
              │  static product    │ │ useCart,        │ │  useWishlist       │
              │  data, layout      │ │ useTheme        │ │  (localStorage)    │
              └───────────┬───────┘ └──────┬─────────┘ └──────────┬─────────┘
                          │                │                      │
                          │        ┌───────▼─────────┐            │
                          │        │ 3D (client-only)│            │
                          │        │ HeroScene /     │            │
                          │        │ JerseyViewer    │            │
                          │        └─────────────────┘            │
                          │                                       │
                          └──────────────────┬────────────────────┘
                                             │  HTTP (Server Actions / Route Handlers)
                                             ▼
                      ┌───────────────────────────────────────────────────┐
                      │             NEXT.JS SERVER (Node)                 │
                      │   /api/auth/*   /api/checkout  /api/create-order  │
                      └────────┬──────────────┬──────────────┬────────────┘
                               │ next-auth     │ Stripe SDK   │ Prisma
                               ▼              ▼              ▼
                        ┌──────────┐    ┌─────────────┐   ┌─────────────────┐
                        │  JWT     │    │ Stripe      │   │ PostgreSQL      │
                        │  session │    │ PaymentIntent│   │ (User, Order,   │
                        └──────────┘    └─────────────┘   │  OrderItem)     │
                                                          └─────────────────┘
```

**High-level data flow:**

1. **Pages** are mostly Server Components that read the **static `PRODUCTS` array** (`src/lib/products.ts`) at build/render time — no DB hit for catalog data.
2. **Client Components** handle interactivity (cart drawer, wishlist, checkout, theme, 3D) and read/write **Zustand stores** persisted to `localStorage`.
3. **Authentication** goes through the NextAuth route handler `/api/auth/[...nextauth]`, which validates credentials against the **PostgreSQL `User` table** via Prisma and returns a **JWT**.
4. **Checkout** calls `/api/checkout` to create a Stripe **PaymentIntent** (INR), then `/api/create-order` to persist the order (Prisma). If Stripe keys / DB aren't configured, both gracefully return a **demo success** so the flow still demos end-to-end.
5. **3D** runs entirely client-side; `HeroScene`/`JerseyViewer` detect WebGL and fall back to static images when unavailable.

---

## 📂 Project Structure

```
jersey-store/
├── prisma/
│   ├── schema.prisma          # DB schema (Users, Orders, Vendors, Products, ...)
│   └── seed.ts                # Seed data: products, vendor, admin user
├── src/
│   ├── app/                   # App Router pages & API routes
│   │   ├── layout.tsx         # Root layout (Providers + Toaster)
│   │   ├── page.tsx           # Homepage (3D hero + featured products)
│   │   ├── globals.css        # Tailwind + global styles
│   │   ├── not-found.tsx      # 404 page
│   │   ├── products/          # Catalog listing + detail (3D viewer)
│   │   ├── categories/[slug]/ # Category browsing
│   │   ├── checkout/          # Multi-step Stripe checkout + success
│   │   ├── account/           # Account home, orders, wishlist
│   │   ├── auth/              # Sign-in / sign-up pages
│   │   ├── vendor/apply/      # Vendor application form
│   │   ├── contact|help|cookies|privacy|returns|shipping|terms/  # Static pages
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # NextAuth handler
│   │       ├── auth/signup/         # Register (bcrypt + Prisma)
│   │       ├── checkout/            # Stripe PaymentIntent
│   │       └── create-order/        # Persist order (Prisma, demo fallback)
│   ├── components/
│   │   ├── 3d/                # hero-scene.tsx, jersey-viewer.tsx
│   │   ├── ui/                # button, card, input, badge, tabs, toaster
│   │   ├── navbar.tsx         # Nav + cart badge + theme toggle
│   │   ├── footer.tsx
│   │   ├── product-card.tsx   # Catalog card (add to cart / wishlist)
│   │   ├── cart-drawer.tsx    # Slide-out cart
│   │   └── providers.tsx      # Session + Theme + Query providers
│   ├── lib/
│   │   ├── products.ts        # STATIC product catalog + helpers
│   │   ├── auth.ts            # NextAuth options (Credentials + JWT)
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── stripe.ts          # Stripe server + client loaders
│   │   ├── sanity.ts          # ⚠️ UNUSED (dead CMS client)
│   │   └── utils.ts           # cn, formatPrice, generateOrderNumber, ...
│   ├── store/
│   │   ├── cart.ts            # Zustand cart (persisted)
│   │   └── wishlist.ts        # Zustand wishlist (persisted)
│   └── middleware.ts          # Protects /account & /vendor (auth required)
├── .env / .env.example        # Environment variables
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 📦 Data Sources: Static Products vs. Database

This is important for anyone extending the app.

**Products are STATIC.** `src/lib/products.ts` exports:

- `PRODUCTS` — the product array (id, slug, name, price, image, team, season, category, ...)
- `CATEGORIES` — retro / current / world-cup collections
- `getProductBySlug(slug)` — by slug lookup
- `getProductsByCategory(category)` — filter by category
- `getFeaturedProducts()` — featured subset

They are imported directly into pages — **no database read** for catalog data.

**The database (PostgreSQL via Prisma) is used for:**

- `User` records — credentials authentication (`api/auth/[...nextauth]`, `api/auth/signup`)
- `Order` + `OrderItem` — persisted on checkout via `api/create-order`

The Prisma schema also **defines** `Product`, `Category`, `Vendor`, `CartItem`, `WishlistItem`, `Review`, `Payout`, etc., but these are **not currently exercised at runtime** by the UI — products/cart/wishlist are handled client-side.

---

## 🔐 Auth Flow

1. User submits email + password at `/auth/signin` (or registers at `/auth/signup` → bcrypt-hashed password saved via Prisma).
2. NextAuth `CredentialsProvider` (`src/lib/auth.ts`) looks up the user in the `User` table and compares with `bcrypt.compare`.
3. On success a **JWT** is issued (`session: { strategy: 'jwt' }`), with `id` and `role` attached via callbacks.
4. `src/middleware.ts` (NextAuth middleware) protects `/account/:path*` and `/vendor/:path*` — unauthenticated visitors are redirected to `/auth/signin`.
5. `useSession()` in client components reads the session to show the user's name and a sign-out button.

---

## 💳 Checkout & Payment Flow

```
Cart (Zustand + localStorage)
        │  ➜ /checkout  (multi-step: Shipping → Payment → Review)
        ▼
/checkout page builds payment form (Stripe Elements)
        │
        ▼  POST /api/checkout  { amount, items }
/checkout route  →  stripe.paymentIntents.create({ amount, currency: 'inr' })
        │            returns { clientSecret }
        ▼
PaymentElement + stripe.confirmPayment(...)
        │
        ├─ on success  →  POST /api/create-order  (persists Order + OrderItems via Prisma)
        │                 →  /checkout/success
        └─ on failure  →  toast error

DEMO MODE:
  • If STRIPE_SECRET_KEY is unset → /api/checkout returns 503 with demo:true (graceful).
  • If the DB is unconfigured → /api/create-order returns a generated order number
    with demo:true so checkout completes.
```

---

## 🛒 Cart & Wishlist Flow (Client State)

Both are **Zustand stores persisted to `localStorage`** — no server round-trip:

- **Cart** (`src/store/cart.ts`) — items, add/remove, quantity, totals, and `isOpen` (drawer state). Persisted under key `jersey-store-cart`. `addItem` auto-opens the drawer.
- **Wishlist** (`src/store/wishlist.ts`) — a set of product IDs (+ `toggle`/`has`/`remove`). Persisted under key `jersey-store-wishlist`.

Consumers: `navbar.tsx` (cart badge + drawer toggle), `cart-drawer.tsx`, `product-card.tsx`, the product detail page, and `account/wishlist/page.tsx`. The wishlist page renders saved products (empty-state fallback), lets you remove items and add them to the cart.

> The corresponding DB models (`CartItem`, `WishlistItem`) exist in the schema but the UI uses the client stores.

---

## 🎮 3D Rendering

- **`src/components/3d/hero-scene.tsx`** — homepage hero. Three procedurally-built jerseys (boxes/sleeves/collar), floating animation via `useFrame`, `OrbitControls` with auto-rotate, `Environment` preset, `ContactShadows`, and a progress `Loader`. WebGL detection `useEffect` disables the canvas and returns `null` if unavailable.
- **`src/components/3d/jersey-viewer.tsx`** — per-product viewer on the PDP, color-adjustable from the color selector, rendered via `next/dynamic` with `ssr: false`.

**Why it's lazy-loaded:** Three.js is heavy, so both are pulled in with `next/dynamic({ ssr: false })` to keep initial JS small and avoid SSR canvas issues.

---

## 🗺️ Routing Map

| Route | Type | Description |
|-------|------|-------------|
| `/` | Page | Homepage: 3D hero, categories, featured products |
| `/products` | Page | Full catalog (searchable via navbar query) |
| `/products/[slug]` | Page (dynamic) | Product detail + 3D viewer |
| `/categories/[slug]` | Page (dynamic) | Products in a category |
| `/checkout` | Page | Multi-step Stripe checkout |
| `/checkout/success` | Page | Order confirmation |
| `/account` | Protected | Account dashboard |
| `/account/orders` | Protected | Order list |
| `/account/wishlist` | Protected | Wishlist (client store) |
| `/auth/signin` | Page | Sign in |
| `/auth/signup` | Page | Register |
| `/vendor/apply` | Protected | Vendor application form |
| `/contact`, `/help`, `/cookies`, `/privacy`, `/returns`, `/shipping`, `/terms` | Page | Static content |
| `/api/auth/[...nextauth]` | API | NextAuth handler |
| `/api/auth/signup` | API | Registration (bcrypt + Prisma) |
| `/api/checkout` | API | Stripe PaymentIntent |
| `/api/create-order` | API | Persist order (demo fallback) |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd jersey-store
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is used due to npm's strict peer resolution on this setup.

### 2. Set up environment

```bash
cp .env.example .env
# DATABASE_URL, NEXTAUTH_SECRET, Stripe keys as needed
```

### 3. Set up the database (for auth + order persistence)

```bash
# PostgreSQL must be running, then:
npm run db:push       # push Prisma schema
npm run db:seed       # seed products, vendor, admin user
```

> If you skip this, the site still runs: catalog is static, and auth/checkout fall back to demo mode.

### 4. Run

```bash
npm run dev
# open http://localhost:3000

# or production:
npm run build && npm run start

# view from another device on your LAN:
npm run dev -- -H 192.168.1.2
# then open http://192.168.1.2:3000
```

---

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `headerr0001@gmail.com` | `admin123` |
| **Owner** | `owner@example.com` | `owner123` |
| **Worker** | `worker@example.com` | `worker123` |

> Demo credentials are also hinted on the sign-in page.

---

## 📝 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema
npm run db:seed      # Seed database
npm run postcss      # (no-op; next run handles PostCSS)
```

---

## 📄 License

MIT
