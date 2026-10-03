import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { isRole, type Role } from '@/lib/rbac';

// NOTE: this module reads SUPABASE_SERVICE_ROLE_KEY. It intentionally does NOT
// import `server-only` so that `@/lib/api-guard` (which is exercised by the test
// suite) can reach the session resolver. The key is still never exposed to the
// browser: Next.js replaces non-`NEXT_PUBLIC_` env references with `undefined` in
// client bundles, and every consumer of this module runs on the server.
export type AdminSession =
  | { status: 'anonymous' }
  | { status: 'forbidden' }
  | { status: 'ok'; user: User; role: Role };

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase service-role credentials are not configured on the server.');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Resolves the caller's admin session from the Supabase auth cookie only.
 *
 * The role is read from `admin_users` on the server. Client-supplied role or
 * "isAdmin" style values are never consulted, and the role string is validated
 * against the known set so an unexpected value fails closed.
 */
export async function getAdminSession(): Promise<AdminSession> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'anonymous' };

  const service = serviceClient();
  const { data, error } = await service
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  // Fail closed on a query error as well as on a missing row.
  if (error || !data || !isRole(data.role)) return { status: 'forbidden' };

  return { status: 'ok', user, role: data.role };
}

export async function adminDataClient() {
  return serviceClient();
}