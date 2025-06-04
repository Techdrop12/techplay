// ───────────────────────────────────────────────────────────────────
//   middleware.js
// ───────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { middleware as secureHeaders } from './middleware-security'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

// 👉 Liste des chemins qu’on autorise sans aucune interruption (manifest, SW, icons, etc.)
const publicFilePatterns = [
  '/manifest.json',              // <–– autoriser le manifest
  '/firebase-messaging-sw.js',   // <–– autoriser le service worker Firebase
  '/favicon.ico',
  '/robots.txt',
  '/icons/',
  '/images/',
  '/fonts/',
]

// ───────────────────────────────────────────────────────────────────
//   Fonction middleware
// ───────────────────────────────────────────────────────────────────
export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 1) Si le chemin commence exactement par l’un des publicFilePatterns → on laisse passer “tel quel”
  //    Exemple : `/manifest.json`, `/firebase-messaging-sw.js`, `/icons/icon-192x192.png`, etc.
  for (const p of publicFilePatterns) {
    if (pathname === p || pathname.startsWith(p)) {
      // On applique uniquement les headers de sécurité, rien d’autre.
      return secureHeaders(request)
    }
  }

  // 2) Si le chemin pointe vers _next (ressources internes Next.js) ou l’API → on laisse passer aussi
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/')
  ) {
    return secureHeaders(request)
  }

  // 3) Mode maintenance
  const maintenanceOn = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = pathname === '/maintenance'
  if (maintenanceOn && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.redirect(url)
  }

  // 4) Protection des routes admin (après avoir exclu les fichiers publics)
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 5) Si on arrive ici, c’est une page “cliente” normale (pas `/manifest.json`, pas `/_next`, pas `/api`, pas admin protégé).
  //    On applique donc l’internationalisation avant de renvoyer le résultat dans secureHeaders.
  const responseIntl = intlMiddleware(request)
  return secureHeaders(request, responseIntl)
}

// ───────────────────────────────────────────────────────────────────
//   matcher
//   On indique que ce middleware s’applique à toutes les routes “normalisées”
//   (hors les chemins exclus plus haut).
// ───────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    /*
      Cette expression régulière signifie : “pour toutes les routes
      qui ne commencent pas par /_next/, /api/, /favicon.ico, /manifest.json,
      /firebase-messaging-sw.js, /robots.txt, /icons/, /images/, /fonts/”…
      appliquez le middleware. Les chemins publics listés plus haut
      sont traités au tout début de la fonction avant d’arriver ici.
    */
    '/((?!_next/|api/|favicon\\.ico$|manifest\\.json$|firebase-messaging-sw\\.js$|robots\\.txt$|icons/|images/|fonts/).*)',
  ],
}
