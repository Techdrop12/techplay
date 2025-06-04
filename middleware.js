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
// Liste des chemins statiques à autoriser UID (pas de redirect / 401)
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
  '/api/', // tous vos endpoints API (dont save-token, send-push, test‐admin, etc.)
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1) Si c’est un fichier “pur” (manifest, SW, favicon, robots, etc.), on ne touche pas à l’auth ni i18n
  if (PUBLIC_PATHS.includes(pathname)) {
    return secureHeaders(request);
  }
  // 2) Si l’URL commence par un préfixe public (/_next/, /icons/, /api/, etc.), idem
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return secureHeaders(request);
    }
  }

  // 3) Mode “maintenance” : si activé, on redirige tout (sauf /admin et /maintenance) vers /maintenance
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 4) Protection des routes `/admin/*` avec NextAuth
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token || token.role !== 'admin') {
      // redirige vers /login si pas admin
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // Si admin, on continue (avec headers sécurisés)
    return secureHeaders(request);
  }

  // 5) Pour toutes les autres routes “client” (non /api, non /admin, non PJ statiques) :
  //    on applique d’abord l’internationalisation, puis les headers de sécurité.
  const responseIntl = await intlMiddleware(request);
  return secureHeaders(request, responseIntl);
}

// ───────────────────────────────────────────────────────────────────
// matcher : applique ce middleware à toutes les routes sauf celles
// explicitement autorisées (/_next/, /api/, manifest, SW, etc.)
// ───────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
      “Pour toutes les routes qui ne sont pas :
       - /_next/*
       - /api/*
       - /favicon.ico
       - /robots.txt
       - /manifest.json
       - /firebase-messaging-sw.js
       - tout ce qui commence par /icons/, /images/, /fonts/, /static/
      appliquez ce middleware.”
    */
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|firebase-messaging-sw\\.js$|icons/|images/|fonts/|static/).*)',
  ],
};
