import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { DEFAULT_LOCALE } from '@/lib/language';

const ADMIN_ROLES = new Set(['admin', 'ops', 'support', 'content', 'read_only']);

const SUPPORTED_LOCALES = ['fr', 'en'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_COOKIE = 'NEXT_LOCALE';

const LOCALIZABLE_ROOTS = [
  '/cart',
  '/commande',
  '/blog',
  '/categorie',
  '/contact',
  '/faq',
  '/cgv',
  '/confidentialite',
  '/mentions-legales',
  '/compare',
];

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
  return DEFAULT_LOCALE as Locale;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname?.replace(/\/+/g, '/').trim() || '';

  // Root → /fr redirect
  const isRoot = pathname === '' || pathname === '/';
  if (isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url, 307);
  }

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

  // Account route protection
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

  // Admin routes — set x-pathname header + JWT protection
  if (pathname.startsWith('/admin')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);

    if (pathname.startsWith('/admin/login')) {
      return NextResponse.next({ request: { headers: requestHeaders } });
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

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/account/:path*',
    '/cart',
    '/cart/:path*',
    '/commande',
    '/commande/:path*',
    '/blog',
    '/blog/:path*',
    '/categorie',
    '/categorie/:path*',
    '/contact',
    '/faq',
    '/cgv',
    '/confidentialite',
    '/mentions-legales',
    '/compare',
  ],
};
