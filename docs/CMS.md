# HEADERR Visual CMS — Architecture & Manual

The store owner manages the customer-facing site from **Website** in `/admin`
without editing code. React is the rendering engine; the database is the source
of truth for content and design. CMS fields store **typed configuration only** —
never JavaScript, React, or executable HTML.

## 1. Rendering: one renderer, two data sources

```
ADMIN → editor state → Zod validation → DATABASE → shared renderer
LIVE:    published columns ──────────────► renderHomepageSections ──► storefront
PREVIEW: draft columns ──────────────────► renderHomepageSections ──► admin preview
```

- `src/components/website/section-registry.tsx` — 12 sections, `renderSection`,
  `renderHomepageSections` (enabled-in-order, or the full-layout fallback when
  none are enabled). Live page and all previews call it.
- `src/lib/homepage.ts` — `getHomepageSections(sb, 'live'|'draft')`,
  `getHomepageRenderData`. The public homepage reads through the anon-safe
  `get_published_homepage_sections()` RPC, so **unpublished drafts never leave
  the database** on the public path.
- `SectionShell` (`section-shell.tsx`) wraps every section and applies the
  per-section `settings.design` (background, colors, heading size, spacing,
  alignment, radius, shadow, entrance animation, hide on desktop/tablet/mobile)
  — but only keys listed in `SECTION_SUPPORT[key]`. No fake controls.

## 2. Website → Home (theme editor)

Three panes: section list | live preview (desktop/tablet/mobile + zoom) |
inspector (content fields + element chips + Design group).

- Select / add (multi-instance allowed) / **duplicate** / **delete** (two-click
  confirm) / drag-reorder / enable toggle.
- Click any section — or a marked element (heading, image, button, pricing…) —
  in the preview: the inspector jumps to the matching fields (`data-cms` →
  `SECTION_ELEMENTS` → `data-field` highlighting).
- Typing is local until **Save Draft**; drafts never touch live content.
  **Publish** copies the draft over live, clears drafts, records a version, and
  uses optimistic locking: publishing over someone else's publish returns
  HTTP 409 with a Reload-latest action. **Undo/redo** covers structural ops plus
  typing bursts.
- Deleting a section then saving a draft stages the deletion (`draft_deleted`);
  live keeps serving it until publish. **Discard** clears all draft state.

## 3. Theme, Header, Footer, Navigation, Pages, Templates, Media, Products

- **Website → Theme** (`site_settings.theme`): ~90 tokens — colors, font
  families, 12 type roles (desktop/mobile size + weight), radii, spacing.
  Emitted as `--th-*` CSS variables consumed by Tailwind config + `globals.css`,
  so retheming recolors chrome, buttons, badges, and sections following tokens.
- **Header/Footer** (`site_settings.header/footer`): logo, tagline, sticky /
  transparency, colors, icons, nav spacing; brand block, legal links, wordmark.
  Link columns come from **Navigation**.
- **Navigation**: friendly destination picker (site pages, products, CMS pages,
  external URL, advanced custom path) instead of raw URLs. Validated
  server-side; dangerous schemes rejected.
- **Pages** (`site_pages`): block content (heading, text, image, button,
  divider) rendered at `/<slug>` through the same `StaticBlocks` component the
  admin preview uses. Reserved slugs (shop, admin, checkout…) are rejected so a
  page can never shadow store flows. SEO title/description per page.
- **Templates** (`site_settings.templates`): product card (ratio, badges,
  wishlist, quick add, compare price, description, radius), product page
  (thumbnail position, quantity, Buy Now, shipping section, trust badges,
  accordions, related count/title), collection grid (columns, count, filters,
  sort). One change updates every product/collection at once.
- **Media Library**: upload (magic-byte verified), search, kind filter, alt
  text, library picker in every image field. Deleting shows **"used in X
  places"** with locations; referenced assets are blocked unless force-deleted.
  Storage objects are removed alongside their rows.
- **Products**: name/slug/category/edition/team/season/badge, pricing, primary
  + gallery images (reorder, alt text, set-primary), sizes, fit/material/care,
  shipping & returns notes, SEO, published/featured, per-product **variants**
  (size, color, SKU, price override, stock), storefront preview link. Bulk
  stock stays in Store → Inventory.

## 4. Versions & audit

- Every homepage publish and every theme/header/footer/templates save records a
  `cms_versions` row (author, timestamp, snapshot, summary; last 30 kept).
- Website → Home → **History**: version list (V-numbers, author, time), exact
  preview of any version, one-click **Restore** (pre-restore state is versioned
  first, so restores are undoable).
- `audit_logs` records actor/role/action/resource/summary for publishes,
  settings saves, product/variant/inventory changes, uploads, media deletes,
  page changes, order/review/admin-user actions. No secrets logged.

## 5. Security model (defense in depth)

1. Supabase Auth identity; `requireAdmin()` (any `admin_users` row) on every
   admin page + API. Self-demotion/removal and last-admin removal are blocked.
2. Same-origin check + per-IP rate limits (admin / upload / expensive buckets)
   on mutations; HTTP 429 on excess.
3. Strict Zod validation at every trust boundary (12 section schemas + design,
   theme, chrome, templates, pages, products, variants, inventory, coupons).
4. Ownership-safe reads: anon RLS + security-definer RPC for published
   homepage; drafts, versions, audit, media, coupons, orders admin-only.
5. Upload pipeline: auth → rate limit → origin → size cap → **magic-byte sniff**
   (extension/content-type derived from bytes, not client headers) →
   allowlisted folder → storage → audit log.
6. Security headers incl. CSP (`next.config.js`); no `dangerouslySetInnerHTML`
   except the generated theme stylesheet (validated tokens only); no raw CMS
   HTML rendering anywhere.

## 6. Migrations & checks

Idempotent `scripts/migrate-*.ts` (run with `npx tsx`, needs `DATABASE_URL`):
theme-editor, section-instances, site-pages, products-cms, cms-versions,
security. Verify with `npx tsx scripts/check-cms.ts`,
`npx tsx scripts/check-section-schemas.ts`, `npx tsc --noEmit`, `npm run build`.

## 7. Acceptance checklist (all doable without code)

Hero heading/image/mobile image/CTA + destination picker · disable/move/add/
duplicate/delete sections · section background, text colors, typography scale,
spacing, animation, desktop/mobile layout + per-breakpoint visibility · header
logo/nav/destinations · footer content · global theme colors/typography ·
product create/edit, variants, stock · media upload/replace + usage guard ·
desktop/tablet/mobile preview · draft → preview → publish → storefront ·
version history + restore.
