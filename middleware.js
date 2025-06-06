// middleware.js

import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { middleware as secureHeaders } from './middleware-security';

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});

// → On inclut ici les chemins “public” même sous /fr/ ou /en/
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/sw.js',
  '/firebase-messaging-sw.js',

  // Les mêmes ressources lorsqu’elles sont demandées depuis /fr/ ou /en/
  '/fr/manifest.json',
  '/en/manifest.json',
  '/fr/sw.js',
  '/en/sw.js',
  '/fr/firebase-messaging-sw.js',
  '/en/firebase-messaging-sw.js',
  '/fr/favicon.ico',
  '/en/favicon.ico',
  '/fr/robots.txt',
  '/en/robots.txt'
];

const PUBLIC_PREFIXES = [
  '/_next/',
  '/images/',
  '/fonts/',
  '/static/',
  '/api/',

  // Dossier public "icons" et ses versions préfixées
  '/icons/',
  '/fr/icons/',
  '/en/icons/',

  // Exemple pour d’autres dossiers publics
  '/carousel',
  '/fr/carousel',
  '/en/carousel'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Si c’est exactement l’un des chemins publics → on laisse passer
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 1b) Si l’URL commence par un des préfixes publics → on laisse passer
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // 2) Redirige "/" vers "/fr"
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // 3) Mode “maintenance” (sauf pour /admin et /maintenance)
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage =
    pathname === '/maintenance' ||
    pathname === '/fr/maintenance' ||
    pathname === '/en/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 4) Protection des routes “/admin” → on vérifie le token NextAuth + rôle “admin”
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/fr/connexion';
      return NextResponse.redirect(url);
    }
    // Si l’utilisateur est admin, on applique simplement les headers de sécurité
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
        - /favicon.ico, /robots.txt, /manifest.json, /sw.js, /firebase-messaging-sw.js
        - /fr/ et /en/ versions de ces mêmes fichiers
        - dossiers /icons/, /fr/icons/, /en/icons/, /images/, /fonts/, /static/
    */
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)'
  ]
};
