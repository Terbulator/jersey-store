import "dotenv/config";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../generated/prisma8/contract";
import contractJson from "../generated/prisma8/contract.json" with { type: "json" };

const connectionString = process.env["DATABASE_URL"]!;

const db = postgres<Contract>({ url: connectionString, contractJson });

async function main() {
  const users = await db.orm.public.User.limit(5).all();
  console.log("USERS (v8):", JSON.stringify(users, null, 2));

  const products = await db.orm.public.Product.limit(5).all();
  console.log("PRODUCTS (v8):", JSON.stringify(products, null, 2));
}

main()
  .then(async () => {
    await db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error("PoC FAILED:", err);
    process.exit(1);
  });