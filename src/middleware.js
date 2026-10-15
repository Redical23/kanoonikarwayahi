import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Public paths that anyone can access without being logged in
const PUBLIC_PATHS = [
  '/',
  '/Login',
  '/Register',
  '/about',
  '/termsofservice',
  '/privacypolicy',
  '/contact',
  '/faq',
  '/cancellationandrefund',
  '/forgot-password',
  '/reset-password',
  '/News',
  '/Constitustion',
];

// Paths that logged-in users should NOT be able to visit
const AUTH_ONLY_PATHS = ['/Login', '/Register'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow all public paths without any token check
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // --- Unauthenticated user trying to access a protected route ---
  if (!token) {
    // Preserve where they were trying to go so we can redirect back after login
    const loginUrl = new URL('/Login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Logged-in user trying to visit Login/Register pages ---
  if (AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL(`/pruser/${token.email}`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Only run middleware on app routes — skip:
   *  - _next/static  (Next.js static files)
   *  - _next/image   (image optimisation)
   *  - favicon.ico
   *  - public assets (png, jpg, svg, …)
   *  - api routes (NextAuth handles its own auth)
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|webp|woff2?)$).*)'
  ],
};

