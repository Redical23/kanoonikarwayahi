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

const isProduction = process.env.NODE_ENV === 'production';

// Must match the cookie name set in route.js
// On Vercel (HTTPS) NextAuth uses __Secure- prefix; on localhost it doesn't
const COOKIE_NAME = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow all public paths without any token check
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: COOKIE_NAME,
  });

  // --- Unauthenticated user trying to access a protected route ---
  if (!token) {
    const loginUrl = new URL('/Login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- Logged-in user trying to visit Login/Register pages ---
  if (AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL('/pruser/homepage', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|webp|woff2?)$).*)'
  ],
};
