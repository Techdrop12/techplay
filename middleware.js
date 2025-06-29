import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { applySecureHeaders } from './middleware-security.js';
import intlConfig from './src/lib/next-intl.config.js';

const intlMiddleware = createMiddleware({ ...intlConfig });

const STATIC_FILES = [
  'favicon.ico',
  'manifest.json',
  'robots.txt',
  'sw.js',
  'firebase-messaging-sw.js',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 🧩 Cas des fichiers statiques avec langue (ex: /fr/manifest.json)
  const matchStatic = pathname.match(/^\/(fr|en)\/(.+)$/);
  if (matchStatic) {
    const [, , file] = matchStatic;
    if (STATIC_FILES.includes(file) || file.startsWith('icons/')) {
      return NextResponse.rewrite(new URL(`/${file}`, request.url));
    }
  }

  // ✅ Autoriser le passage des fichiers publics sans middleware
  const PUBLIC_PATHS = [
    ...STATIC_FILES.flatMap((f) => [`/${f}`, `/fr/${f}`, `/en/${f}`]),
  ];
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const PUBLIC_PREFIXES = [
    '/_next/', '/api/', '/images/', '/fonts/', '/static/',
    '/icons/', '/fr/icons/', '/en/icons/',
  ];
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // 🌐 Rediriger / vers /fr
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // 🚧 Mode maintenance (sauf admin ou /maintenance)
  const isMaintenance = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePath = ['/maintenance', '/fr/maintenance', '/en/maintenance'].includes(pathname);

  if (isMaintenance && !isAdminPath && !isMaintenancePath) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 🔐 Protection admin (JWT + rôle admin requis)
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/fr/connexion';
      return NextResponse.redirect(url);
    }
  }

  // 🌍 i18n dynamique (en dernier)
  const intlResponse = await intlMiddleware(request);

  // 🛡️ Headers de sécurité
  return applySecureHeaders(intlResponse);
}

export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)',
  ],
};
