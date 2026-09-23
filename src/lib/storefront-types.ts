// Pure types + row mappers for the storefront. No imports — safe in client bundles.
// Fetching lives in `@/lib/storefront` (server-only).

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  label: string | null;
  description: string | null;
}

export interface Edition {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  edition: string;
  team: string | null;
  season: string | null;
  basePrice: number;
  comparePrice: number | null;
  badge: string | null;
  image: string;
  imageAlt: string;
  images: string[];
  description: string | null;
  fit: string | null;
  material: string | null;
  care: string | null;
  sizes: string[];
  shipping: string | null;
  returns: string | null;
  featured: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  customerEmail: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  productId: string | null;
  productName: string | null;
  productVariant: string;
  photoUrl: string | null;
  photoAlt: string | null;
  verifiedBuyer: boolean;
  featured: boolean;
  createdAt: string;
}

export interface NavItem {
  id: string;
  section: string;
  label: string;
  href: string;
  active: boolean;
  sortOrder: number;
}

// ---- Row shapes (as stored in Supabase) ----

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  edition: string;
  team: string | null;
  season: string | null;
  price: number | string | null;
  compare_price: number | string | null;
  badge: string | null;
  image: string | null;
  image_alt: string | null;
  images: unknown;
  description: string | null;
  fit: string | null;
  material: string | null;
  care: string | null;
  sizes: unknown;
  shipping_note: string | null;
  returns_note: string | null;
  featured: boolean;
}

const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

const numOrNull = (v: number | string | null | undefined): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v);

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    edition: row.edition,
    team: row.team,
    season: row.season,
    basePrice: Number(row.price ?? 0),
    comparePrice: numOrNull(row.compare_price),
    badge: row.badge,
    image: row.image ?? '',
    imageAlt: row.image_alt ?? '',
    images: strArray(row.images),
    description: row.description,
    fit: row.fit,
    material: row.material,
    care: row.care,
    sizes: strArray(row.sizes),
    shipping: row.shipping_note,
    returns: row.returns_note,
    featured: !!row.featured,
  };
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  label: string | null;
  description: string | null;
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    image: row.image ?? '',
    label: row.label,
    description: row.description,
  };
}

interface EditionRow {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export function mapEdition(row: EditionRow): Edition {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    description: row.description,
  };
}

interface ReviewRow {
  id: string;
  product_id: string | null;
  product_name: string | null;
  product_variant: string | null;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  verified_buyer: boolean;
  featured: boolean;
  photo_url: string | null;
  created_at: string;
}

export function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    rating: row.rating,
    title: row.title,
    body: row.body,
    productId: row.product_id,
    productName: row.product_name,
    productVariant: row.product_variant ?? '',
    photoUrl: row.photo_url,
    photoAlt: null,
    verifiedBuyer: !!row.verified_buyer,
    featured: !!row.featured,
    createdAt: row.created_at,
  };
}

interface NavItemRow {
  id: string;
  section: string;
  label: string;
  href: string;
  active: boolean;
  sort_order: number;
}

export function mapNavItem(row: NavItemRow): NavItem {
  return {
    id: row.id,
    section: row.section,
    label: row.label,
    href: row.href,
    active: !!row.active,
    sortOrder: row.sort_order,
  };
}