// middleware.js

import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { middleware as secureHeaders } from './middleware-security';

// → Configuration i18n
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});

// ────────────
// Chemins accessibles sans authentification ni i18n
// ────────────
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/sw.js',                    // SW généré par next-pwa
  '/firebase-messaging-sw.js', // SW Firebase Messaging
];
const PUBLIC_PREFIXES = [
  '/_next/',
  '/icons/',
  '/images/',
  '/fonts/',
  '/static/',
  '/api/', // Vos endpoints API publics
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Si c’est dans PUBLIC_PATHS → on applique juste les headers de sécurité
  if (PUBLIC_PATHS.includes(pathname)) {
    return secureHeaders(request);
  }
  // 2) Si c’est un préfixe public (_next, icons, api…) → idem
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return secureHeaders(request);
    }
  }

  // 3) Mode maintenance → redirection vers /maintenance (sauf /admin et /maintenance)
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 4) Protection des routes /admin/* → vérification token NextAuth
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return secureHeaders(request);
  }

  // 5) Toutes les autres pages “client” → on applique i18n puis headers
  const responseIntl = await intlMiddleware(request);
  return secureHeaders(request, responseIntl);
}

export const config = {
  matcher: [
    /*
      Applique ce middleware à toutes les routes sauf :
        - files /_next/*
        - files /api/*
        - fichiers listés dans PUBLIC_PATHS
        - dossiers icons/, images/, fonts/, static/
    */
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|images/|fonts/|static/).*)',
  ],
};
