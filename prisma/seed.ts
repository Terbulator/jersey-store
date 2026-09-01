import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role, VendorStatus, Size } from '../src/generated/prisma/client';
import { createClient } from '@supabase/supabase-js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_USERS = [
  { email: 'headerr0001@gmail.com', name: 'Admin', password: 'admin123', role: Role.ADMIN },
  { email: 'owner@example.com', name: 'Demo Owner', password: 'owner123', role: Role.OWNER },
  { email: 'worker@example.com', name: 'Demo Worker', password: 'worker123', role: Role.WORKER },
];

async function ensureAuthUser(email: string, password: string, name: string, role: Role) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);
  if (found) {
    await supabase.auth.admin.updateUserById(found.id, {
      password,
      app_metadata: { role },
      user_metadata: { name },
    });
    return found.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
    user_metadata: { name },
  });
  if (error) throw new Error(`Supabase auth create ${email}: ${error.message}`);
  return data.user!.id;
}

async function main() {
  console.log('🌱 Seeding database…');

  for (const u of DEMO_USERS) {
    await ensureAuthUser(u.email, u.password, u.name, u.role);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { email: u.email, name: u.name, role: u.role },
    });
  }

  const ownerUser = await prisma.user.findUniqueOrThrow({ where: { email: 'owner@example.com' } });
  const workerUser = await prisma.user.findUniqueOrThrow({ where: { email: 'worker@example.com' } });

  const vendor = await prisma.vendor.upsert({
    where: { userId: ownerUser.id },
    update: {},
    create: {
      userId: ownerUser.id,
      storeName: 'Demo Store',
      slug: 'demo-store',
      description: 'Authentic retro and current football jerseys',
      commissionRate: 0.15,
      status: VendorStatus.APPROVED,
    },
  });

  await prisma.worker.upsert({
    where: { userId: workerUser.id },
    update: {},
    create: {
      ownerId: ownerUser.id,
      userId: workerUser.id,
      name: 'Demo Worker',
      email: 'worker@example.com',
      status: 'ACTIVE',
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'retro' },
      update: {},
      create: { name: 'Retro', slug: 'retro', description: 'Classic jerseys from 1990-2015' },
    }),
    prisma.category.upsert({
      where: { slug: 'current' },
      update: {},
      create: { name: 'Current Season', slug: 'current', description: '2024/25 official kits' },
    }),
    prisma.category.upsert({
      where: { slug: 'world-cup' },
      update: {},
      create: { name: 'World Cup', slug: 'world-cup', description: 'National team jerseys' },
    }),
  ]);

  const SIZES: Size[] = [Size.XS, Size.S, Size.M, Size.L, Size.XL, Size.XXL];
  const COLORS = [
    { color: 'Home Red', hex: '#dc2626' },
    { color: 'Away Blue', hex: '#1e40af' },
    { color: 'Third Green', hex: '#16a34a' },
  ];

  const products = [
    {
      name: 'Barcelona 2014/15 Home — Messi #10',
      slug: 'barcelona-2015-messi-home',
      basePrice: 449, comparePrice: 599,
      team: 'Barcelona', season: '2014/15', player: '10',
      image: 'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=800&q=80',
      categoryId: categories[0].id, featured: true,
    },
    {
      name: 'Manchester United 2007/08 Home — Ronaldo #7',
      slug: 'manchester-united-2008-ronaldo',
      basePrice: 449, comparePrice: 599,
      team: 'Manchester United', season: '2007/08', player: '7',
      image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80',
      categoryId: categories[0].id, featured: true,
    },
    {
      name: 'AC Milan 2006/07 Home — Ibrahimović #9',
      slug: 'ac-milan-2006-ibrahimovic',
      basePrice: 449,
      team: 'AC Milan', season: '2006/07', player: '9',
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80',
      categoryId: categories[0].id,
    },
    {
      name: 'Argentina 2022 World Cup — Messi #10',
      slug: 'argentina-2022-world-cup',
      basePrice: 549,
      team: 'Argentina', season: '2022', player: '10',
      image: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=800&q=80',
      categoryId: categories[2].id, featured: true,
    },
    {
      name: 'Arsenal 2024/25 Home',
      slug: 'arsenal-2024-home',
      basePrice: 449,
      team: 'Arsenal', season: '2024/25',
      image: 'https://images.unsplash.com/photo-1602674809970-1d8a2c4d6c8e?w=800&q=80',
      categoryId: categories[1].id,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        vendorId: vendor.id,
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: `Premium ${p.name}. Authentic design with embroidered details and moisture-wicking fabric.`,
        basePrice: p.basePrice,
        comparePrice: p.comparePrice,
        team: p.team,
        season: p.season,
        player: p.player,
        published: true,
        featured: p.featured || false,
      },
    });

    // Upsert image (avoid duplicates on re-seed)
    const existingImage = await prisma.productImage.findFirst({ where: { productId: product.id } });
    if (!existingImage) {
      await prisma.productImage.create({
        data: { productId: product.id, url: p.image, alt: p.name, isPrimary: true, position: 0 },
      });
    }

    // Upsert variants (avoid duplicates on re-seed)
    const existingVariant = await prisma.productVariant.findFirst({ where: { productId: product.id } });
    if (!existingVariant) {
      for (const size of SIZES) {
        for (const color of COLORS) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              sku: `${product.slug}-${size}-${color.color}`.toUpperCase(),
              size, color: color.color, colorHex: color.hex,
              price: p.basePrice,
              stock: 20,
            },
          });
        }
      }
    }
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
