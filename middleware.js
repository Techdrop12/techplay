// middleware.js

import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { middleware as secureHeaders } from './middleware-security';

/**
 * 1) Crée le middleware i18n avec next-intl
 */
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});

/**
 * 2) Liste des fichiers statiques que l’on doit réécrire quand on est préfixé par /fr ou /en
 *    (manifest.json, favicon.ico, robots.txt, sw.js, firebase-messaging-sw.js, etc.)
 */
const STATIC_FILES = [
  'manifest.json',
  'favicon.ico',
  'robots.txt',
  'sw.js',
  'firebase-messaging-sw.js'
];

/**
 * 3) Le middleware principal
 */
export async function middleware(request) {
  const { nextUrl } = request;
  const { pathname } = nextUrl;

  // ──────────────────────────────────────────────────────────────────────────
  // A) Si l’URL est du type "/fr/manifest.json" ou "/en/robots.txt", "/fr/sw.js", etc.
  //    → on réécrit en statique “plein” sans la locale.
  //
  //    Exemples :
  //      • /fr/manifest.json  → /manifest.json
  //      • /en/favicon.ico    → /favicon.ico
  //      • /fr/icons/...      → /icons/...
  //      • /en/icons/mon-icon.png → /icons/mon-icon.png
  // ──────────────────────────────────────────────────────────────────────────
  const matchLocaleStatic = pathname.match(/^\/(fr|en)\/(.+)$/);
  if (matchLocaleStatic) {
    const [, locale, restPath] = matchLocaleStatic;

    // a) Si c’est un fichier dans STATIC_FILES (manifest.json, robots.txt, etc.)
    if (STATIC_FILES.includes(restPath)) {
      const rewriteUrl = new URL(`/${restPath}`, request.url);
      return NextResponse.rewrite(rewriteUrl);
    }

    // b) Si c’est dans /icons/ (ou tout autre dossier statique dont on veut
    //    autoriser la version préfixée par locale)
    if (restPath.startsWith('icons/')) {
      const rewriteUrl = new URL(`/${restPath}`, request.url);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // B) PUBLIC_PATHS stricts (sans réécriture), on laisse passer “tel quel” :
  //    • /favicon.ico, /robots.txt, /manifest.json, /sw.js, /firebase-messaging-sw.js
  //    • et, par extension, on ajoute explicitement les mêmes URLs quand on est
  //      sous /fr/ ou /en/ (voir PUBLIC_PATHS_LOCALE plus bas).
  // ──────────────────────────────────────────────────────────────────────────
  const PUBLIC_PATHS = [
    '/favicon.ico',
    '/robots.txt',
    '/manifest.json',
    '/sw.js',
    '/firebase-messaging-sw.js',

    // Exact matches quand on est préfixé par /fr ou /en
    '/fr/favicon.ico',
    '/fr/robots.txt',
    '/fr/manifest.json',
    '/fr/sw.js',
    '/fr/firebase-messaging-sw.js',
    '/en/favicon.ico',
    '/en/robots.txt',
    '/en/manifest.json',
    '/en/sw.js',
    '/en/firebase-messaging-sw.js'
  ];

  if (PUBLIC_PATHS.includes(pathname)) {
    // On laisse 100% passer (pas de réécriture, pas de protection admin, juste un NextResponse.next())
    return NextResponse.next();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // C) Public prefixes : si l’URL commence par l’un de ces préfixes, on laisse passer.
  //    (/_next/, /api/, /icons/, /images/, /fonts/, /static/, /fr/icons/, /en/icons/ …)
  // ──────────────────────────────────────────────────────────────────────────
  const PUBLIC_PREFIXES = [
    '/_next/',
    '/api/',
    '/images/',
    '/fonts/',
    '/static/',

    // Les icônes stockées dans public/icons
    '/icons/',
    '/fr/icons/',
    '/en/icons/'
  ];
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return NextResponse.next();
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // D) Redirection "/" → "/fr"
  // ──────────────────────────────────────────────────────────────────────────
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // E) Mode “maintenance” si défini dans .env (sauf /admin et /maintenance)
  // ──────────────────────────────────────────────────────────────────────────
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

  // ──────────────────────────────────────────────────────────────────────────
  // F) Protection des routes /admin → on vérifie le token NextAuth + rôle “admin”
  // ──────────────────────────────────────────────────────────────────────────
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    if (!token || token.role !== 'admin') {
      // Si pas admin, on redirige systématiquement vers "/fr/connexion" (par défaut)
      const url = request.nextUrl.clone();
      url.pathname = '/fr/connexion';
      return NextResponse.redirect(url);
    }
    // Si c’est un admin authentifié → on applique seulement les headers sécurisés
    return secureHeaders(request);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // G) Toutes les autres pages “client” → i18n puis secureHeaders
  // ──────────────────────────────────────────────────────────────────────────
  const responseIntl = await intlMiddleware(request);
  return secureHeaders(request, responseIntl);
}

// Pour indiquer à Next.js où appliquer ce middleware
export const config = {
  matcher: [
    /*
      Applique ce middleware à toutes les routes, sauf celles commençant par :
      - /_next/
      - /api/
      - (les static paths gérées plus haut : manifest.json, favicon.ico, sw.js, robots.txt, firebase-messaging-sw.js)
      - /icons/, /fr/icons/, /en/icons/, /images/, /fonts/, /static/
    */
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)'
  ]
};
