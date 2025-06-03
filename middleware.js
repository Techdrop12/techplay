// middleware.js

import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'

// 1) Middleware i18n (Next-Intl)
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

// 2) Liste des fichiers publics qu’on ignore complètement
const excludedPaths = [
  '/manifest.json',
  '/firebase-messaging-sw.js',
  '/favicon.ico',
  '/robots.txt',
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ──────────────────────────────────────────────────────────────
  // A) SI on demande "manifest.json" ou "firebase-messaging-sw.js"
  //    on fait juste NextResponse.next(), sans exécuter le reste.
  // ──────────────────────────────────────────────────────────────
  if (excludedPaths.includes(pathname)) {
    // Exit immédiat : le navigateur reçoit le fichier sans 401
    return NextResponse.next()
  }

  // ──────────────────────────────────────────────────────────────
  // B) SI on demande un asset statique (images, fonts, icônes, .js/.css/.json/.xml, etc.)
  //    on ajoute juste les headers de sécurité, puis "NextResponse.next()".
  // ──────────────────────────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|json|xml|txt)$/)
  ) {
    return secureHeaders(request)
  }

  // ──────────────────────────────────────────────────────────────
  // C) MODE MAINTENANCE (redirection vers "/maintenance" si activé)
  // ──────────────────────────────────────────────────────────────
  const maintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = pathname === '/maintenance'

  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/maintenance'
    return NextResponse.redirect(redirectUrl)
  }

  // ──────────────────────────────────────────────────────────────
  // D) PROTECTION DES ROUTES /admin (NextAuth)
  // ──────────────────────────────────────────────────────────────
  if (isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })
    if (!token || token.role !== 'admin') {
      // Pas admin → on redirige sur /login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ──────────────────────────────────────────────────────────────
  // E) POUR TOUT LE RESTE : i18n + headers de sécurité
  // ──────────────────────────────────────────────────────────────
  const response = intlMiddleware(request)
  return secureHeaders(request, response)
}

// ─────────────────────────────────────────────────────────────────
// Matcher : on exclut explicitement tout ce qui commence par /_next, /api, /icons, etc.
// ainsi que /manifest.json et /firebase-messaging-sw.js.
// ─────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|manifest.json|firebase-messaging-sw.js|robots.txt|icons|images|fonts|.*\\..*).*)',
  ],
}
