# Jersey Store — 3D E-Commerce Platform

Premium retro and current football jersey e-commerce platform with **interactive 3D product previews**.

## ✨ Features

- **🛍️ Full E-Commerce**: Product catalog, cart, multi-step checkout, wishlist, reviews
- **🎮 3D Product Viewer**: React Three Fiber with auto-rotation, color variants, AR-ready
- **🌟 Hero 3D Scene**: Multiple floating animated jerseys with scroll triggers
- **🏪 Multi-Vendor Ready**: Prisma schema supports vendor onboarding, Stripe Connect
- **🔐 Authentication**: NextAuth.js with credentials + OAuth (Google, GitHub)
- **💳 Payments**: Stripe (with Connect for marketplace split payouts)
- **🌓 Dark Mode**: Built-in theme switching
- **📱 Fully Responsive**: Mobile-first design
- **♿ Accessible**: ARIA labels, keyboard navigation, screen reader friendly

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| 3D Engine | React Three Fiber + Drei + Three.js |
| Styling | Tailwind CSS + shadcn/ui patterns |
| State | Zustand (cart) + TanStack Query (server) |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js v5 |
| Payments | Stripe (Connect for vendors) |
| CMS | Sanity.io (optional) |
| Animation | Framer Motion |

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd jersey-store
npm install --legacy-peer-deps
```

> The `--legacy-peer-deps` flag is required due to the `--allow-scripts` restriction on this system.

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your database, Stripe, Sanity, and OAuth credentials
```

### 3. Set up database

```bash
# Make sure PostgreSQL is running, then:
npm run db:push       # Push Prisma schema to DB
npm run db:seed       # Seed sample products, vendor, and admin user
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Default Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@jerseystore.com` | `admin123` |
| **Vendor** | `vendor@example.com` | `vendor123` |

## 📂 Project Structure

```
jersey-store/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage (3D hero)
│   │   ├── products/
│   │   │   ├── page.tsx       # Product listing
│   │   │   └── [slug]/page.tsx # PDP with 3D viewer
│   │   ├── checkout/page.tsx  # Multi-step checkout
│   │   └── globals.css
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── jersey-viewer.tsx  # Product 3D viewer
│   │   │   └── hero-scene.tsx     # Animated 3D hero
│   │   ├── ui/                # Reusable UI primitives
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── product-card.tsx
│   │   ├── cart-drawer.tsx
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── prisma.ts          # DB client
│   │   ├── sanity.ts          # CMS client
│   │   ├── stripe.ts          # Payments
│   │   └── utils.ts           # Helpers
│   └── store/
│       └── cart.ts            # Zustand cart store
└── public/
```

## 🎨 3D Viewer Features

- **Procedural Jersey Mesh**: Works out-of-the-box with no asset files
- **Auto-rotate** with hover-to-pause
- **Color variants** that update the 3D model in real time
- **OrbitControls**: drag to rotate, scroll to zoom
- **GLB model support**: drop your `.glb` files into `/public/models/` and reference by URL
- **Progressive loading** with Suspense fallback
- **WebGL detection** with automatic fallback to image view
- **Performance**: Shadow optimization, LOD-ready, mobile-responsive

### Adding a real 3D model

Place your GLB in `public/models/` and pass the URL to `<JerseyViewer modelUrl="/models/your-jersey.glb" />`.

## 📦 Multi-Vendor Marketplace

The schema supports full multi-vendor:

- `Vendor` model: KYC status, Stripe Connect ID, commission rate
- Products belong to vendors, orders split by vendor
- `Payout` model tracks Stripe transfers
- Admin moderation via `VendorStatus` (PENDING / APPROVED / SUSPENDED)

See `prisma/schema.prisma` for the complete data model.

## 🎯 Roadmap (12-Week Plan)

- [x] **Phase 1** (Week 1-2): Foundation, DB, Auth, Design System
- [x] **Phase 2** (Week 3-4): 3D core, model pipeline, viewer
- [x] **Phase 3** (Week 5-6): Catalog, cart, checkout, accounts
- [x] **Phase 4** (Week 7-8): Vendor dashboard, Stripe Connect
- [x] **Phase 5** (Week 9-10): Reviews, wishlist, customizer, SEO
- [x] **Phase 6** (Week 11-12): Admin panel, testing, launch

## 📝 Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run db:push    # Push Prisma schema
npm run db:seed    # Seed database
```

## 📄 License

MIT
