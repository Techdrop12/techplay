import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

// Fichiers et chemins qui ne doivent jamais être interceptés
const excludedPaths = [
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/firebase-messaging-sw.js',
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Autorise les fichiers publics, les assets statiques et les exclusions
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    excludedPaths.includes(pathname) ||
    pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|json|txt)$/)
  ) {
    return secureHeaders(request)
  }

  // Mode maintenance (redirige vers /maintenance sauf admin)
  const maintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = pathname === '/maintenance'

  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/maintenance'
    return NextResponse.redirect(redirectUrl)
  }

  // Auth admin (protège /admin)
  if (isAdminPath && !excludedPaths.includes(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Ajout headers de sécurité
  const response = intlMiddleware(request)
  return secureHeaders(request, response)
}

// ✅ Matcher corrigé : laisse passer manifest.json, assets, fichiers publics
export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|manifest.json|firebase-messaging-sw.js|robots.txt|icons|images|fonts|.*\\..*).*)',
  ],
}
