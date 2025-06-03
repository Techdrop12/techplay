// middleware.js
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'

// 1) Configuration pour next-intl (i18n)
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

// 2) Chemins à exclure complètement du middleware
const excludedPaths = [
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/firebase-messaging-sw.js',
  // Ajoutez ici d’autres noms de fichiers si nécessaire (ex. '/robots.txt')
]

/**
 * Fonction middleware principale.
 * Elle va :
 *  - laisser passer (avec seulement les headers de sécurité) les fichiers statiques listés dans excludedPaths
 *    ou toute URL qui contient une extension (.js, .css, .png, .json, etc.)
 *  - faire la maintenance / auth / i18n pour toutes les autres routes “dynamiques”.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl

  // 3) Si c’est une requête API ou vers _next, on ne fait que poser les headers de sécurité
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    excludedPaths.includes(pathname) ||
    // Toute URL qui se termine par une extension statique (JS, CSS, images, JSON…)
    /\.(js|css|png|jpg|jpeg|svg|webp|ico|json|txt)$/.test(pathname)
  ) {
    // On ne fait que poser les headers essentiels et on laisse passer
    return secureHeaders(request)
  }

  // 4) Mode maintenance : redirige vers /maintenance si activé et qu’on n’est pas admin
  const maintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = pathname === '/maintenance'

  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/maintenance'
    return NextResponse.redirect(redirectUrl)
  }

  // 5) Protection des routes /admin/* : vérifie le token NextAuth
  if (isAdminPath && !excludedPaths.includes(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 6) Pour les autres routes (pages “dynamiques”), on applique :
  //    – le middleware i18n (intlMiddleware)
  //    – puis on pose les headers de sécurité
  const response = intlMiddleware(request)
  return secureHeaders(request, response)
}

/**
 * 7) Matcher :
 *    – Seuls les chemins qui ne commencent pas par "_next", "api", ni par un nom de fichier statique (manifest.json, etc.)
 *      déclenchent réellement ce middleware.
 *    – Les « excludedPaths » (manifest.json, firebase-messaging-sw.js, etc.) et tous les fichiers avec extension
 *      (.js, .css, .png, .json…) sont exclus du middleware.
 */
export const config = {
  matcher: [
    '/((?!_next|api|favicon\\.ico|manifest\\.json|firebase-messaging-sw\\.js|robots\\.txt|.*\\..*).*)',
  ],
}
