# Jersey Store — Accurate Project Context (for a fresh ChatGPT session)

> This doc reflects the **current state of `main`** on `jersey-store` (Next.js 14 e-commerce platform, "HEADERR"). README.md and HANDOFF.md are **stale** — trust this file. Verified Sep 2026.

## What this is

Premium football/cricket jersey e-commerce storefront (`/`) + a full Admin CMS (`/admin`) + auth. Deployed at https://jersey-store-five.vercel.app (auto-deploys from `main`).

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.5 (App Router, TypeScript 5.5) |
| Styling | Tailwind CSS 3.4 + shadcn/ui primitives (`src/components/ui/*`) |
| Auth | **Supabase** via `@supabase/ssr` (SSR cookies). NOT NextAuth. |
| Data layer | **Supabase Postgres** — tables + RLS defined in `supabase/*.sql`. The app talks to Supabase directly. |
| Payments | Stripe (PaymentIntent, INR) |
| Client state | Zustand (cart, wishlist — localStorage) |
| Forms/validation | React Hook Form + Zod |
| Animations | Framer Motion; 3D via @react-three/fiber (hero, viewer) |
| Misc deps | @tanstack/react-query (provider present), sonner, lucide-react |

> **Prisma is legacy here**: `prisma/schema.prisma` + `src/lib/prisma.ts` still exist but nothing at runtime imports the client — the storefront and admin both read/write Supabase directly. Don't add new Prisma usage.

## Auth model

- Supabase Auth (email/password) holds identity. `src/middleware.ts` guards `/account`, `/owner`, `/worker`, `/admin`, `/reseller`, redirecting unauthenticated users to `/login?redirect=...`.
- **Admin role is NOT a User column.** Admins are rows in the Supabase `admin_users` table (`user_id`, `role`). `src/lib/admin.ts` → `getAdminSession()` checks `admin_users` via the service-role client; `requireAdmin()` redirects anonymous → `/login?redirect=/admin` and non-admins → `/account`.
- Promote a user to admin: `npm run tsx scripts/grant-admin.ts <email>`.
- Sign-out must go through `POST /api/auth/signout` (server clears Supabase SSR cookies; the client SDK can't). All logout buttons call it.

## Data layer (Supabase — this is the source of truth for content)

- Schema/RLS: `supabase/storefront.sql`, `supabase/deny-policies.sql`, `supabase/persistence.sql` (guest cart/wishlist sync).
- Seed: `supabase/seed-storefront.ts`; also `scripts/check-sync.ts`, `scripts/inspect-db.ts`, `scripts/migrate-offers.ts`, `scripts/migrate-theme-editor.ts`.
- Key tables read by the storefront (`src/lib/storefront.ts`): `products`, `categories`, `editions`, `reviews`, `navigation_items`, plus `settings`, `banners`, `campaigns`, `collections`, `coupons`, `offers`, `promo_slides`, `announcements`, `media`, `orders`, `admin_users`, `shipping_settings`, `theme_presets`/theme tables.
- `src/lib/storefront-types.ts` maps raw rows → typed `Product/Category/Edition/NavItem/Review`.

## Routes

Storefront: `/` (homepage), `/shop`, `/shop/football`, `/shop/cricket`, `/shop/streetwear`, `/shop/products/[slug]`, `/search`, `/wishlist`, `/cart`, `/bundle`, `/subscribe`, `/culture`, `/about`, `/login`, `/signup`, `/forgot-password`, `/account` (+ `/account/orders`, `/account/addresses`), `/checkout`, `/checkout/success`.

Admin (`/admin`, guarded by `requireAdmin`): dashboard, analytics, products (+ new/edit), inventory, orders, categories, collections, campaigns, banners, promo-slides, announcements, offers, coupons, reviews, customers, admin-users, media, navigation, settings, shipping, homepage, homepage-sections, theme-editor.

API: `src/app/api/` — public (`me`, `cart`, `orders`, `reviews`, `search`, `settings`, `auth/signout`) and `api/admin/*` (CRUD per section; every route starts with `await requireAdmin()`).

## Key lib files (`src/lib/`)

- `admin.ts` — admin session check + service-role data client.
- `admin-crud.ts` — generic admin CRUD helpers on top of `requireAdmin`.
- `admin-nav.ts` — sidebar nav config.
- `storefront.ts` / `storefront-types.ts` — public storefront reads (anon RLS).
- `supabase/server.ts` / `supabase/client.ts` — SSR/client Supabase clients.
- `analytics.ts`, `catalog.ts`, `use-shipping.ts`, `rate-limit.ts`, `merge.ts`, `sync.ts`, `utils.ts`.
- `src/components/admin/*`, `src/components/ui/*` — admin UI + shadcn primitives.

## Commands

```bash
npm run dev            # dev server
npm run build          # type-check + build
npm run lint           # ESLint
npm run db:push        # prisma db push (legacy — schema still kept)
npm run db:seed        # tsx prisma/seed.ts (KNOWN BUG, see below)
npm run db:seed:demo   # tsx prisma/seed-demo.ts
```

Admin grant for a specific user: `npx tsx scripts/grant-admin.ts <email>`.

## Environment variables (see `.env.example`)

- `DATABASE_URL` — Supabase Postgres (legacy; Prisma only)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKETS` (image uploads to Supabase Storage)
- `NEXT_PUBLIC_SUPABASE_PERSISTENCE` — "true" only after `supabase/persistence.sql` is applied
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID` (legacy)
- Sanity: optional, unused.

Local `.env` mirrors the production Supabase project; `.env.local` only holds `VERCEL_OIDC_TOKEN`.

## Current state & known issues

- **README.md is out of date** (describes the old static-catalog/NextAuth build — products are now Supabase-driven, auth is Supabase).
- **HANDOFF.md is stale** — describes reseller-dashboard work (`/reseller/apply`, `Reseller` model) that is **not in this branch's history**.
- Dashboard areas for `owner/worker/reseller` roles are **not implemented** — routes are guarded in middleware but no pages exist for them.
- `npm run db:seed` fails at the vendor upsert (`Vendor_slug_key` — a `demo-store` vendor already exists from seed-demo). Pre-existing, harmless for Supabase-driven features.
- Latest work: Shopify-style theme editor with draft/publish workflow (`/admin/theme-editor`), live-preview sync, global image upload system across admin sections, and the 12-section homepage editor (`/admin/homepage-sections`).