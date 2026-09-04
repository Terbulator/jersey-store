import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// ponytail: session-mode pooler caps at 15 clients; cap each instance's pool low and recycle idle sockets so a few warm functions can't exhaust the cap. Transaction pooler (6543) would fix this outright but would break the interactive $transaction in create-order.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  max: 4,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
