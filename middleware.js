// ✅ middleware.js final optimisé
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ⛔ Fichiers statiques, manifest, PWA, robots.txt
  const excludedPaths = [
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/firebase-messaging-sw.js',
  ]

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    excludedPaths.includes(pathname) ||
    pathname.match(/\.[\w]+$/) // fichiers .js, .css, .png etc.
  ) {
    return secureHeaders(request)
  }

  // 🔧 Maintenance (hors admin/maintenance)
  const maintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = pathname === '/maintenance'

  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/maintenance'
    return NextResponse.redirect(redirectUrl)
  }

  // 🔐 Protection admin
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 🌍 I18n + secure headers
  const response = intlMiddleware(request)
  return secureHeaders(request, response)
}

// ✅ Matcher clair pour ne jamais bloquer manifest.json, icons, etc.
export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|manifest.json|firebase-messaging-sw.js|robots.txt|icons|.*\\..*).*)',
  ],
}
