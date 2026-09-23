# HEADERR — Premium Football & Cricket Jersey Store

Next.js 14 (App Router) ecommerce storefront + visual CMS admin. A non-technical
store owner manages the site from `/admin` — homepage sections, theme, header,
footer, navigation, pages, product display templates, products, variants, and
media — without touching code. See [`docs/CMS.md`](docs/CMS.md) for the CMS
architecture, publishing workflow, and security model.

> Older docs (`HANDOFF.md`, plans in `docs/`) predate the Supabase build. Source
> code is authoritative; this README is verified against it.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.5 (App Router), TypeScript 5.5, React 18 |
| Styling | Tailwind CSS 3.4 + CSS-variable theme tokens (`--th-*`) |
| Data | **Supabase Postgres** — tables + RLS in `supabase/*.sql` (source of truth) |
| Auth | **Supabase Auth** (SSR cookies, `@supabase/ssr`); admin rows in `admin_users` |
| ORM (legacy) | Prisma schema kept, **not used at runtime** — do not add new Prisma usage |
| Payments | Stripe (PaymentIntent, INR) / COD checkout |
| Client state | Zustand (cart, wishlist — localStorage) |
| Validation | Zod on every admin write path |
| Animation | Framer Motion; 3D via @react-three/fiber |

## Routes

Storefront: `/` (DB-driven homepage), `/shop`, `/shop/football|/cricket|/streetwear`,
`/shop/products/[slug]`, `/search`, `/wishlist`, `/cart`, `/bundle`, `/subscribe`,
`/culture`, `/about`, `/login`, `/signup`, `/account…`, `/checkout…`, `/<slug>`
(CMS content pages: Shipping, Returns, FAQ…).

Admin (`/admin`, `requireAdmin` gate): Website → **Home** (visual theme editor),
**Theme**, **Header**, **Footer**, **Pages**, **Templates**, Navigation, Media
Library, Banners, Promo Slides, Announcements; Store → Products, Collections,
Categories, Inventory; Orders, Customers, Reviews; Marketing → Campaigns,
Coupons, Offers; Analytics; System → Shipping, Payments, Settings, Admin Users.

## Quick start

```bash
npm install
cp .env.example .env   # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
                       # SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL (migrations only)
npm run dev            # http://localhost:3000
```

```bash
npm run build          # type-check + production build
npm run lint           # ESLint
npx tsx scripts/check-cms.ts && npx tsx scripts/check-section-schemas.ts
```

Make a user an admin: `npx tsx scripts/grant-admin.ts <email>`.
Sign-out must go through `POST /api/auth/signout` (server clears SSR cookies).

## Database & migrations

Supabase is the runtime database. Schema/RLS live in `supabase/storefront.sql`
(+ `deny-policies.sql`, `persistence.sql`); seed via `supabase/seed-storefront.ts`.
Structural changes ship as idempotent `scripts/migrate-*.ts` scripts run with
`npx tsx` (uses `DATABASE_URL`, raw `pg`):

- `migrate-theme-editor` — homepage draft columns
- `migrate-section-instances` — multi-instance sections, staged deletes
- `migrate-site-pages` — CMS pages (+ public-read RLS)
- `migrate-products-cms` — product SEO, variant color
- `migrate-cms-versions` — version history
- `migrate-security` — audit log, draft-leak lockdown (anon-safe RPC)

## Key conventions

- **Shared renderer**: `renderHomepageSections()` in
  `src/components/website/section-registry.tsx` renders the live homepage and
  every admin preview — one rule, no drift.
- **Typed config, no code in the DB**: Zod schemas (`section-schemas`,
  `product-schemas`, `theme`, `site-chrome`, `display`, `pages`) validate every
  write; React renders the config. `javascript:`/`data:` URLs rejected.
- **Draft → preview → publish** for the homepage; every publish and settings
  save records a restorable version (`cms_versions`); publish uses optimistic
  locking (`baseUpdatedAt` → HTTP 409 on conflict).
- **Server-side auth everywhere**: `requireAdmin()` + origin check + rate limit
  on admin mutations; uploads sniff magic bytes, allowlisted folders only;
  deletions of referenced media are blocked with usage locations.
- Admin actions are audit-logged (`audit_logs`) — actor, action, resource,
  summary. No secrets are ever logged.

## Project layout

```
src/
├── app/            # storefront routes, /admin, /api, /[slug] CMS pages
├── components/website/  # section registry, shell, theme provider, templates
├── components/admin/    # editors, fields, pickers, managers
├── lib/            # homepage, theme, display, chrome, pages, schemas,
│                   # admin, security, audit, versions, media-usage, storefront
├── store/          # zustand cart/wishlist/ui
└── styles/         # globals.css (theme-var driven)
scripts/            # migrations (migrate-*) + checks (check-*)
supabase/           # storefront.sql, deny-policies.sql, persistence.sql
docs/CMS.md         # visual CMS manual
```

## License

MIT
