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
// Chemins et préfixes à exclure du contrôle d’authentification et d’i18n
// ───────────────────────────────────────────────────
const PUBLIC_PATHS = [
  '/favicon.ico',
  '/robots.txt',
  '/manifest.json',            // ← Accès libre
  '/sw.js',                     // ← SW Next-PWA
  '/firebase-messaging-sw.js',  // ← SW Firebase
];
const PUBLIC_PREFIXES = [
  '/_next/',  // ressources du build Next.js
  '/icons/',
  '/images/',
  '/fonts/',
  '/static/',
  '/api/',    // vos endpoints API publics
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ───────────────────────────────────────────────────
  // 0) Si c’est exactement "/", on redirige directement vers "/fr"
  // ───────────────────────────────────────────────────
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // 1) Si c’est exactement un chemin public (manifest, SW, favicon, robots)
  if (PUBLIC_PATHS.includes(pathname)) {
    return secureHeaders(request);
  }
  // 2) Si l’URL commence par l’un des préfixes publics → on laisse passer
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return secureHeaders(request);
    }
  }

  // 3) Mode “maintenance”: on redirige vers /maintenance, sauf les accès /admin et /maintenance eux-mêmes
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdminPath = pathname.startsWith('/admin');
  const isMaintenancePage = pathname === '/maintenance';
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // 4) Protection des routes admin → vérifie le token NextAuth et le rôle “admin”
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    // Si l’utilisateur est admin, on applique simplement les headers
    return secureHeaders(request);
  }

  // 5) Pour toutes les autres pages “client” (non `/api`, non fichiers publics): 
  //    on applique d’abord l’i18n (next-intl), puis les headers de sécurité
  const responseIntl = await intlMiddleware(request);
  return secureHeaders(request, responseIntl);
}

export const config = {
  matcher: [
    /*
      Applique ce middleware à toutes les routes, à l’exception des :
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
