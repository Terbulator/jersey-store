import 'dotenv/config';
import { Client } from 'pg';

// Grant an admin role to a Supabase user by email.
// Usage: npx tsx scripts/grant-admin.ts <email> [ADMIN|OWNER|WORKER]

const email = process.argv[2]?.toLowerCase();
const role = (process.argv[3] ?? 'ADMIN').toUpperCase();

if (!email) {
  console.error('Usage: npx tsx scripts/grant-admin.ts <email> [ADMIN|OWNER|WORKER]');
  process.exit(1);
}

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL! });
  await c.connect();
  const users = await c.query('select id from auth.users where email = $1', [email]);
  if (!users.rows.length) {
    console.error(`No Supabase user with email ${email}.`);
    process.exit(1);
  }
  await c.query(
    `insert into public.admin_users (user_id, role) values ($1, $2)
     on conflict (user_id) do update set role = excluded.role`,
    [users.rows[0].id, role]
  );
  console.log(`${email} granted role ${role}.`);
  await c.end();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });