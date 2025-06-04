// middleware.js

import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { middleware as secureHeaders } from './middleware-security';

// → Configuration i18n pour next-intl
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});

// ----------------------------------------------------------------------------
// Chemins / préfixes statiques à laisser passer sans authentification/redirect
// ----------------------------------------------------------------------------
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/firebase-messaging-sw.js',
];
const PUBLIC_PREFIXES = [
  '/_next/',
  '/icons/',
  '/images/',
  '/fonts/',
  '/static/',
  '/api/', // tous vos endpoints API (save-token, send-push, test-admin, ...)
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Fichiers purement statiques (manifest, SW, etc.)
  if (PUBLIC_PATHS.includes(pathname)) {
    return secureHeaders(request);
  }
  // 2) URL commençant par un préfixe public (/_next/, /icons/, /api/, etc.)
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return secureHeaders(request);
    }
  }

  // 3) Mode “maintenance”
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 4) Protection des routes /admin/*
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
    // Admin authentifié → on autorise avec headers sécurisés
    return secureHeaders(request);
  }

  // 5) Toutes les autres routes client (non /api, non /admin, non statiques)
  const responseIntl = await intlMiddleware(request);
  return secureHeaders(request, responseIntl);
}

// -----------------------------------------
// matcher : toutes les routes sauf celles listées
// -----------------------------------------
export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|firebase-messaging-sw\\.js$|icons/|images/|fonts/|static/).*)',
  ],
};
