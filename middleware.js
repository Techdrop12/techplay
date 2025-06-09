// ✅ middleware.js

import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';
import { middleware as secureHeaders } from './middleware-security';

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});

const STATIC_FILES = [
  'manifest.json',
  'favicon.ico',
  'robots.txt',
  'sw.js',
  'firebase-messaging-sw.js'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // A. Réécriture des fichiers statiques (ex: /fr/manifest.json → /manifest.json)
  const matchStatic = pathname.match(/^\/(fr|en)\/(.+)$/);
  if (matchStatic) {
    const [, , path] = matchStatic;
    if (STATIC_FILES.includes(path) || path.startsWith('icons/')) {
      return NextResponse.rewrite(new URL(`/${path}`, request.url));
    }
  }

  // B. Fichiers publics exacts à laisser passer
  const PUBLIC_PATHS = [
    '/favicon.ico', '/robots.txt', '/manifest.json', '/sw.js', '/firebase-messaging-sw.js',
    '/fr/favicon.ico', '/fr/robots.txt', '/fr/manifest.json', '/fr/sw.js', '/fr/firebase-messaging-sw.js',
    '/en/favicon.ico', '/en/robots.txt', '/en/manifest.json', '/en/sw.js', '/en/firebase-messaging-sw.js'
  ];
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  // C. Préfixes à laisser passer
  const PUBLIC_PREFIXES = [
    '/_next/', '/api/', '/images/', '/fonts/', '/static/', '/icons/',
    '/fr/icons/', '/en/icons/'
  ];
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();

  // D. Redirection / → /fr
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // E. Maintenance (sauf /admin et /maintenance)
  const maintenanceOn = process.env.MAINTENANCE === 'true';
  const isAdmin = pathname.startsWith('/admin');
  const isMaintenance = ['/maintenance', '/fr/maintenance', '/en/maintenance'].includes(pathname);
  if (maintenanceOn && !isAdmin && !isMaintenance) {
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.redirect(url);
  }

  // F. Auth admin obligatoire pour /admin/*
  if (isAdmin) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/fr/connexion';
      return NextResponse.redirect(url);
    }
    return secureHeaders(request); // Headers sécurité admin
  }

  // G. Middleware i18n + headers sécurité (par défaut)
  const response = await intlMiddleware(request);
  return secureHeaders(request, response);
}

export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)'
  ]
};
