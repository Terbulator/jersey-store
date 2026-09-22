import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export type AdminSession =
  | { status: 'anonymous' }
  | { status: 'forbidden' }
  | { status: 'ok'; user: User; role: string };

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function getAdminSession(): Promise<AdminSession> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'anonymous' };

  const service = serviceClient();
  const { data } = await service
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!data) return { status: 'forbidden' };
  return { status: 'ok', user, role: data.role };
}

export async function requireAdmin(): Promise<Exclude<AdminSession, { status: 'anonymous' | 'forbidden' }>> {
  const session = await getAdminSession();
  if (session.status === 'anonymous') redirect('/login?redirect=/admin');
  if (session.status === 'forbidden') redirect('/account');
  return session;
}

export async function adminDataClient() {
  return serviceClient();
}