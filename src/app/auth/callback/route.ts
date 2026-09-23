import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminSession } from '@/lib/admin';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // ignore — callback runs in a route handler, cookies are settable
            }
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  const session = await getAdminSession();
  const isAdmin = session.status === 'ok';
  const validNext = next && next.startsWith('/') && !next.startsWith('//');
  const target = isAdmin ? '/admin' : (validNext ? next : '/account');

  return NextResponse.redirect(`${origin}${target}`);
}