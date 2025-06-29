import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { applySecureHeaders } from './middleware-security';
import intlConfig from '@/lib/next-intl.config.js';

const intlMiddleware = createMiddleware({ ...intlConfig });

const STATIC_FILES = ['manifest.json', 'favicon.ico', 'robots.txt', 'sw.js', 'firebase-messaging-sw.js'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rediriger les fichiers localisés statiques
  const matchStatic = pathname.match(/^\/(fr|en)\/(.+)$/);
  if (matchStatic) {
    const [, , path] = matchStatic;
    if (STATIC_FILES.includes(path) || path.startsWith('icons/')) {
      return NextResponse.rewrite(new URL(`/${path}`, request.url));
    }
  }

  const PUBLIC_PATHS = [
    '/favicon.ico', '/robots.txt', '/manifest.json', '/sw.js', '/firebase-messaging-sw.js',
    '/fr/favicon.ico', '/fr/robots.txt', '/fr/manifest.json', '/fr/sw.js', '/fr/firebase-messaging-sw.js',
    '/en/favicon.ico', '/en/robots.txt', '/en/manifest.json', '/en/sw.js', '/en/firebase-messaging-sw.js',
  ];
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const PUBLIC_PREFIXES = [
    '/_next/', '/api/', '/images/', '/fonts/', '/static/', '/icons/', '/fr/icons/', '/en/icons/',
  ];
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();

  // Redirection / vers /fr
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // Maintenance mode
  const maintenance = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePath = ['/maintenance', '/fr/maintenance', '/en/maintenance'].includes(pathname);
  if (maintenance && !isAdminPath && !isMaintenancePath) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // Auth admin
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/fr/connexion';
      return NextResponse.redirect(url);
    }
  }

  // Middleware i18n
  const intlResponse = await intlMiddleware(request);

  // Appliquer headers sécurisés
  return applySecureHeaders(intlResponse);
}

export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)',
  ],
};
