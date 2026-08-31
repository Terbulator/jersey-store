import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const protectedPaths = ['/account', '/owner', '/worker', '/admin'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path === p || path.startsWith(p + '/'));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  if (user && (path === '/auth/signin' || path === '/auth/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/account/:path*',
    '/owner/:path*',
    '/worker/:path*',
    '/admin/:path*',
    '/auth/signin',
    '/auth/signup',
  ],
};
