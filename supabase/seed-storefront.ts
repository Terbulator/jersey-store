import 'dotenv/config';
import { Client } from 'pg';
import { CATEGORIES, EDITION_TYPES, PRODUCTS } from '../src/data/products';
import { SEED_REVIEWS } from '../src/data/reviews';

const c = new Client({ connectionString: process.env.DATABASE_URL! });

const q = async (sql: string, params: any[] = []) => (await c.query(sql, params)).rows;

const empty = async (t: string) => {
  const r = await c.query(`select count(*)::int ${''}as n from public."${t}"`);
  return r.rows[0].n === 0;
};

async function main() {
  await c.connect();

  if (await empty('categories')) {
    for (const [i, x] of CATEGORIES.entries()) {
      await q(`insert into public.categories (slug, name, image, label, description, sort_order) values ($1,$2,$3,$4,$5,$6)`, [x.slug, x.name, x.image, x.label, x.description, i]);
    }
    console.log('seeded categories');
  }

  if (await empty('editions')) {
    for (const [i, x] of EDITION_TYPES.entries()) {
      await q(`insert into public.editions (slug, name, icon, sort_order) values ($1,$2,$3,$4)`, [x.slug, x.name, x.icon, i]);
    }
    console.log('seeded editions');
  }

  if (await empty('products')) {
    for (const p of PRODUCTS) {
      await q(
        `insert into public.products
          (slug, name, category, edition, team, season, badge, price, compare_price, image, image_alt, images, description, fit, material, care, sizes, shipping_note, returns_note, featured, published)
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,true,true)`,
        [p.slug, p.name, p.category, p.edition, p.team ?? null, p.season ?? null, p.badge ?? null,
         p.basePrice, p.comparePrice ?? null, p.image, p.imageAlt ?? null, JSON.stringify(p.images),
         p.description ?? null, p.fit ?? null, p.material ?? null, p.care ?? null,
         JSON.stringify(p.sizes ?? ['S', 'M', 'L', 'XL', 'XXL']), p.shipping ?? null, p.returns ?? null]
      );
      const [row] = await q(`select id from public.products where slug = $1`, [p.slug]);
      for (const size of p.sizes ?? ['S', 'M', 'L', 'XL', 'XXL']) {
        await q(
          `insert into public.product_variants (product_id, size, sku, price, stock, low_stock_threshold)
           values ($1,$2,$3,$4,$5,5)`,
          [row.id, size, `${p.slug.toUpperCase()}-${size}`, p.basePrice, 15 + Math.floor(Math.random() * 30)]
        );
      }
    }
    console.log('seeded products + variants');
  }

  if (await empty('reviews')) {
    const slugById = new Map(PRODUCTS.map((p) => [p.id, p.slug]));
    const createdById = new Map(SEED_REVIEWS.map((r) => [r.id, r.createdAt]));
    for (const r of SEED_REVIEWS) {
      const slug = slugById.get(r.productId);
      const [prod] = slug ? await q(`select id, name from public.products where slug = $1`, [slug]) : [];
      await q(
        `insert into public.reviews (product_id, product_name, product_variant, customer_name, customer_email, rating, title, body, verified_buyer, status, featured, photo_url, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'approved',$10,$11,$12::timestamptz)`,
        [prod?.id ?? null, prod?.name ?? r.productName, r.productVariant ?? null, r.customerName, r.customerEmail ?? null,
         r.rating, r.title ?? null, r.body ?? null, r.verifiedBuyer ?? false, r.featured ?? false, r.photoUrl ?? null, createdById.get(r.id) ?? new Date().toISOString()]
      );
    }
    console.log('seeded reviews');
  }

  if (await empty('announcements')) {
    const msgs = ['FREE SHIPPING OVER ₹999', '30-DAY RETURNS', 'PLAYER VERSION & MASTER EDITION', 'OFFICIAL KITS — 2026 SEASON'];
    for (const [i, m] of msgs.entries()) {
      await q(`insert into public.announcements (text, active, sort_order) values ($1, true, $2)`, [m, i]);
    }
    console.log('seeded announcements');
  }

  if (await empty('navigation_items')) {
    const nav = [
      ['main', 'Shop', '/shop', 0],
      ['main', 'Football', '/shop/football', 1],
      ['main', 'Cricket', '/shop/cricket', 2],
      ['main', 'Streetwear', '/shop/streetwear', 3],
      ['main', 'Bundle', '/bundle', 4],
      ['main', 'About', '/about', 5],
      ['mobile', 'Shop All', '/shop', 0],
      ['mobile', 'Football', '/shop/football', 1],
      ['mobile', 'Cricket', '/shop/cricket', 2],
      ['mobile', 'Streetwear', '/shop/streetwear', 3],
      ['mobile', 'Bundle & Save', '/bundle', 4],
      ['mobile', 'About', '/about', 5],
      ['mobile', 'Culture', '/culture', 6],
      ['mobile', 'Account', '/account', 7],
      ['footer-shop', 'Football', '/shop/football', 0],
      ['footer-shop', 'Cricket', '/shop/cricket', 1],
      ['footer-shop', 'New Drops', '/shop', 2],
      ['footer-shop', 'Master Edition', '/shop', 3],
      ['footer-shop', 'Player Version', '/shop', 4],
      ['footer-support', 'Contact', 'mailto:hello@headerr.in', 0],
      ['footer-support', 'Shipping', '#', 1],
      ['footer-support', 'Returns', '#', 2],
      ['footer-support', 'Size Guide', '#', 3],
      ['footer-support', 'Order Tracking', '#', 4],
      ['footer-follow', 'Instagram', '#', 0],
      ['footer-follow', 'YouTube', '#', 1],
      ['footer-follow', 'Twitter', '#', 2],
      ['footer-about', 'Our Story', '/about', 0],
      ['footer-about', 'The Culture', '#', 1],
      ['footer-about', 'FAQ', '#', 2],
    ] as const;
    for (const [i, [section, label, href, order]] of nav.entries()) {
      await q(`insert into public.navigation_items (section, label, href, active, sort_order) values ($1,$2,$3,true,$4)`, [section, label, href, order]);
    }
    console.log('seeded navigation');
  }

  if (await empty('homepage_sections')) {
    const sections = [
      ['hero', 'Hero'],
      ['story_slides', 'Story Slides'],
      ['trust_strip', 'Trust Strip'],
      ['category_nav', 'Category Nav'],
      ['best_sellers', 'Best Sellers'],
      ['editorial_split', 'Editorial Split'],
      ['bundle_section', 'Bundle Section'],
      ['stats_section', 'Stats'],
      ['editions_section', 'Editions'],
      ['expert_section', 'Expert Section'],
      ['newsletter_section', 'Newsletter'],
      ['review_section', 'Reviews'],
    ] as const;
    for (const [i, [key, name]] of sections.entries()) {
      await q(`insert into public.homepage_sections (key, name, enabled, sort_order) values ($1,$2,true,$3)`, [key, name, i]);
    }
    console.log('seeded homepage sections');
  }

  if (await empty('promo_slides')) {
    const slides = [
      { eyebrow: 'VOL. 01 — THE 2026 SEASON', headline: 'WEAR THE GAME.', subheadline: 'Player-version football & cricket jerseys. Master-edition streetwear. Cut for the culture that never stops.', cta: 'Shop the Drop', url: '/shop', img: 'https://images.unsplash.com/photo-1485291723934-4b48f2736edd?w=1600&q=80' },
      { eyebrow: '02', headline: 'Play different.', subheadline: 'Cricket', cta: 'Shop Cricket', url: '/shop/cricket', img: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1400&q=80' },
      { eyebrow: '03', headline: 'Built for the game.', subheadline: 'Player Version 25/26', cta: 'Explore Player Version', url: '/shop', img: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1400&q=80' },
      { eyebrow: '04', headline: 'Master the details.', subheadline: null, cta: 'Explore Master Edition', url: '/shop', img: 'https://images.unsplash.com/photo-1585591189603-d914a73ad1e1?w=1400&q=80' },
      { eyebrow: '05', headline: 'The new drop.', subheadline: '2026 Collection', cta: 'Shop New Drop', url: '/shop/new-arrivals', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400&q=80' },
    ] as const;
    for (const [i, s] of slides.entries()) {
      await q(
        `insert into public.promo_slides (eyebrow, headline, subheadline, desktop_image, mobile_image, cta_text, cta_url, status, active, sort_order)
         values ($1,$2,$3, $4,$4, $5,$6, 'active', true, $7)`,
        [s.eyebrow, s.headline, s.subheadline ?? null, s.img, s.cta, s.url, i]
      );
    }
    console.log('seeded promo slides');
  }

  if (await empty('banners')) {
    const banners = [
      { name: 'Bundle Section', eyebrow: 'Bundle & Save', headline: 'More Kit. Less Slip.', copy: 'Stack jerseys, drop the price.', cta: 'Build your bundle', url: '/bundle', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80' },
      { name: 'Editorial Split', eyebrow: 'The HEADERR Standard', headline: 'Built like the Kit. Made for the Fan.', copy: null, cta: 'Our Standard', url: '/about', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=80' },
      { name: 'Expert Section', eyebrow: "Why We're Different", headline: 'History Won\'t Skip Us.', copy: null, cta: null, url: null, img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80' },
    ] as const;
    for (const [i, b] of banners.entries()) {
      await q(
        `insert into public.banners (name, eyebrow, headline, copy, image, cta_text, cta_url, active, sort_order)
         values ($1,$2,$3,$4,$5,$6,$7,true,$8)`,
        [b.name, b.eyebrow, b.headline, b.copy ?? null, b.img, b.cta ?? null, b.url ?? null, i]
      );
    }
    console.log('seeded banners');
  }

  if (await empty('coupons')) {
    await q(`insert into public.coupons (code, type, value, min_spend, max_uses, active) values ('WELCOME10','percent',10,999,500,true)`);
    await q(`insert into public.coupons (code, type, value, min_spend, max_uses, active) values ('JERSEY15','percent',15,1499,500,true)`);
    console.log('seeded coupons');
  }

  if (await empty('site_settings')) {
    const settings: [string, unknown][] = [
      ['site', { name: 'HEADERR', currency: '₹', tagline: 'Premium Football & Cricket Jerseys', announcementActive: true }],
      ['shipping', { freeThreshold: 999, standardRate: 99, returnsWindow: 30 }],
      ['seo', { title: 'HEADERR — Premium Football & Cricket Jerseys', description: 'HEADERR.IN — Premium football + cricket jerseys and streetwear for GEN-Z culture.' }],
    ];
    for (const [k, v] of settings) {
      await q(`insert into public.site_settings (key, value) values ($1, $2)`, [k, JSON.stringify(v)]);
    }
    console.log('seeded site settings');
  }

  if (await empty('collections')) {
    const collections = [
      { slug: 'best-sellers', name: 'Best Sellers', description: 'The pieces flying off the rack.', product_slugs: PRODUCTS.slice(0, 8).map((p) => p.slug) },
      { slug: 'new-arrivals', name: 'New Arrivals', description: 'Fresh drops.', product_slugs: PRODUCTS.slice(-4).map((p) => p.slug) },
      { slug: 'sale', name: 'Sale', description: 'Marked down master editions.', product_slugs: PRODUCTS.filter((p) => p.badge === 'SALE').map((p) => p.slug) },
    ] as const;
    for (const [i, x] of collections.entries()) {
      await q(`insert into public.collections (slug, name, description, product_slugs, active, sort_order) values ($1,$2,$3,$4,true,$5)`, [x.slug, x.name, x.description, JSON.stringify(x.product_slugs), i]);
    }
    console.log('seeded collections');
  }

  // admin_users: link the known admin to Supabase auth id (email lookup, idempotent).
  const au = await q(`select id from auth.users where email = lower('headerr0001@gmail.com') limit 1`);
  if (au.length) {
    await q(`insert into public.admin_users (user_id, role) values ($1,'ADMIN') on conflict (user_id) do nothing`, [au[0].id]);
    console.log('admin_user seeded:', au[0].id);
  } else {
    console.log('WARN: headerr0001@gmail.com not found in auth.users');
  }

  await c.end();
  console.log('\nSEED COMPLETE');
}

main().catch(async (e) => { console.error('SEED ERR', e.message); try { await c.end(); } catch {} process.exit(1); });