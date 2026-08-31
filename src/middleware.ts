export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/account/:path*', '/owner/:path*', '/worker/:path*', '/admin/:path*'],
};
