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
// Liste des chemins statiques à autoriser TEL QUEL (pas de 401, pas de redirect)
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
  '/api/',          // Vos endpoints API (dont save-token, send-push, test-admin, etc.)
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ---------------------------------------------------------------
  // 1) Si c’est un fichier “pur” (manifest.json, SW, favicon, robots, etc.)
  //    on ne touche pas à l’auth ni à l’i18n, on applique simplement les
  //    headers de sécurité (secureHeaders) et on laisse passer “next()”.
  // ---------------------------------------------------------------
  if (PUBLIC_PATHS.includes(pathname)) {
    return secureHeaders(request);
  }
  // Si l’URL commence par un des préfixes publics (/_next/, /icons/, /api/, etc.)
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return secureHeaders(request);
    }
  }

  // ---------------------------------------------------------------
  // 2) Mode “maintenance” : si activé, on redirige tout (sauf /admin
  //    et /maintenance) vers la page /maintenance
  // ---------------------------------------------------------------
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // ---------------------------------------------------------------
  // 3) Protection des routes “/admin/*” : on vérifie le token NextAuth
  //    si ce n’est pas un admin, on redirige vers la page /login
  // ---------------------------------------------------------------
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    // Si pas de token ou le rôle n’est pas “admin”, redirection :
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // Si administrateur, on passe au next (avec headers sécurisés)
    return secureHeaders(request);
  }

  // ---------------------------------------------------------------
  // 4) Toutes les autres pages “client” (non /api, non /admin, non fichiers statiques)
  //    : on applique d’abord le middleware i18n (next-intl), puis on ajoute les
  //    headers de sécurité sur la réponse
  // ---------------------------------------------------------------
  const responseIntl = await intlMiddleware(request);
  return secureHeaders(request, responseIntl);
}

// ---------------------------------------------------------------
// matcher : applique ce middleware à toutes les routes
// sauf celles explicitement autorisées plus haut (/_next/, /api/, manifest, SW, etc.)
// ---------------------------------------------------------------
export const config = {
  matcher: [
    /*
      Cette expression régulière signifie :
      “Pour toutes les routes qui ne sont PAS :
         - un fichier /_next/*
         - un endpoint /api/*
         - /favicon.ico
         - /robots.txt
         - /manifest.json
         - /firebase-messaging-sw.js
         - un static à /icons/, /images/, /fonts/, /static/
       Applique ce middleware.”
    */
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|firebase-messaging-sw\\.js$|icons/|images/|fonts/|static/).*)',
  ],
};
