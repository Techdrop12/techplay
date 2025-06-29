import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { applySecureHeaders } from './middleware-security';
import intlConfig from '@/lib/next-intl.config.js';

const intlMiddleware = createMiddleware({ ...intlConfig });

const STATIC_FILES = [
  'manifest.json',
  'favicon.ico',
  'robots.txt',
  'sw.js',
  'firebase-messaging-sw.js',
];

const PUBLIC_PATHS = [
  ...STATIC_FILES.map((f) => `/${f}`),
  ...STATIC_FILES.map((f) => `/fr/${f}`),
  ...STATIC_FILES.map((f) => `/en/${f}`),
];

const PUBLIC_PREFIXES = [
  '/_next/',
  '/api/',
  '/images/',
  '/fonts/',
  '/static/',
  '/icons/',
  '/fr/icons/',
  '/en/icons/',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🔁 Redirection des fichiers localisés (ex: /fr/manifest.json -> /manifest.json)
  const matchStatic = pathname.match(/^\/(fr|en)\/(.+)$/);
  if (matchStatic) {
    const [, , path] = matchStatic;
    if (STATIC_FILES.includes(path) || path.startsWith('icons/')) {
      return NextResponse.rewrite(new URL(`/${path}`, request.url));
    }
  }

  // ⛔ Ignorer les fichiers publics purs
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();

  // 🌍 Redirection automatique / -> /fr
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // 🛠 Mode maintenance
  const maintenance = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = ['/maintenance', '/fr/maintenance', '/en/maintenance'].includes(pathname);
  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 🔐 Authentification Admin
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/fr/connexion';
      return NextResponse.redirect(url);
    }
  }

  // 🌐 Internationalisation
  const intlResponse = await intlMiddleware(request);

  // 🛡 Headers de sécurité (via middleware-security.js)
  return applySecureHeaders(intlResponse);
}

export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)',
  ],
};
