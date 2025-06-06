// middleware.js

import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { middleware as secureHeaders } from './middleware-security';

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});

// On inclut maintenant également "/fr/manifest.json" et "/en/manifest.json".
// De même pour "/fr/icons/" et "/en/icons/".
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',
  '/sw.js',
  '/firebase-messaging-sw.js',

  // On autorise explicitement ces mêmes fichiers quand on est sous /fr/ ou /en/
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

  // Icônes dans public/icons : on autorise aussi les versions préfixées par la locale
  '/icons/',
  '/fr/icons/',
  '/en/icons/',

  // Si vous avez d’autres dossiers publics (par ex. /carousel), vous pouvez également ajouter
  '/carousel',
  '/fr/carousel',
  '/en/carousel'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Si c’est exactement un chemin public (ex: "/fr/manifest.json") → on laisse passer
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 1b) Si l’URL commence par un prefixe public (ex: "/fr/icons/…") → on laisse passer
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // 2) Redirige "/" → "/fr"
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // 3) Maintenance (sauf /admin et /maintenance)
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/maintenance' || pathname === '/fr/maintenance' || pathname === '/en/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 4) Protection des routes /admin
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    if (!token || token.role !== 'admin') {
      // Si l’utilisateur n’est pas admin, on le redirige vers "/fr/connexion"
      // (ou "/en/connexion" si vous souhaitez gérer la locale dynamiquement).
      // Ici on redirige toujours vers "/fr/connexion" par défaut.
      const url = request.nextUrl.clone();
      url.pathname = '/fr/connexion';
      return NextResponse.redirect(url);
    }
    // Si admin, on applique juste les headers sécurisés
    return secureHeaders(request);
  }

  // 5) Pour toutes les autres pages, appliquer d’abord i18n, puis sécuriser les headers
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
