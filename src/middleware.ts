import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROLES = new Set(['admin', 'ops', 'support', 'content', 'read_only']);

const SUPPORTED_LOCALES = ['fr', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];
const DEFAULT_LOCALE: Locale = 'fr';

const LOCALE_COOKIE = 'NEXT_LOCALE';

const LOCALIZABLE_ROOTS = ['/cart', '/commande', '/blog'];

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && (SUPPORTED_LOCALES as readonly string[]).includes(cookie)) {
    return cookie as Locale;
  }

  const accept = request.headers.get('accept-language') || '';
  for (const part of accept.split(',')) {
    const lang = part.trim().split(';')[0]?.trim().split('-')[0]?.toLowerCase();
    if (lang && (SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
      return lang as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root localizable routes to locale-prefixed versions
  const localizableRoot = LOCALIZABLE_ROOTS.find(
    (root) => pathname === root || pathname.startsWith(`${root}/`)
  );

  if (localizableRoot) {
    const locale = detectLocale(request);
    const suffix = pathname.slice(localizableRoot.length);
    const target = new URL(`/${locale}${localizableRoot}${suffix}`, request.url);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, { status: 308 });
  }

  // Account route protection (requires any valid session)
  if (pathname.startsWith('/account')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    });
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Admin route protection
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  const role = token?.role as string | undefined;
  if (!token || !role || !ADMIN_ROLES.has(role)) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/cart',
    '/cart/:path*',
    '/commande',
    '/commande/:path*',
    '/blog',
    '/blog/:path*',
  ],
};
