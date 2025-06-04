// middleware.js

import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { middleware as secureHeaders } from './middleware-security';

// → Configuration i18n (next-intl)
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});

// ───────────────────────────────────────────────────
// Chemins / préfixes EXCLUS du contrôle admin / i18n
// ───────────────────────────────────────────────────
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/sw.js',
  '/firebase-messaging-sw.js',
];
const PUBLIC_PREFIXES = [
  '/_next/',
  '/icons/',
  '/images/',
  '/fonts/',
  '/static/',
  '/api/',
  '/carousel', // permet à /carousel1.jpg, /carousel2.jpg, /carousel3.jpg d’être servis en public
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Si c’est un “chemin public” (manifest, SW, favicon, robots) → on laisse passer
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }
  // 1b) Si l’URL commence par l’un des préfixes publics → on laisse passer
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // 2) Rediriger “/” vers “/fr”
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // 3) Mode “maintenance” (si activé via .env) → redirige vers /maintenance sauf /admin et /maintenance
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 4) Protection des routes /admin → vérifie token NextAuth + rôle “admin”
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // Si l’utilisateur est admin → on applique juste les headers de sécurité
    return secureHeaders(request);
  }

  // 5) Toutes les autres pages “client” → on applique d’abord i18n, puis secureHeaders
  const responseIntl = await intlMiddleware(request);
  return secureHeaders(request, responseIntl);
}

export const config = {
  matcher: [
    /*
      Applique ce middleware à toutes les routes, sauf :
        - /_next/*
        - /api/*
        - /favicon.ico
        - /robots.txt
        - /manifest.json
        - /sw.js
        - /firebase-messaging-sw.js
        - dossiers /icons/, /images/, /fonts/, /static/
    */
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|images/|fonts/|static/).*)',
  ],
};
