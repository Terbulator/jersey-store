import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    const count = await prisma.product.count();
    console.log(`✅ Connected. ${count} product(s) in the database.`);
  } catch (err) {
    console.error('❌ Prisma verify failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
