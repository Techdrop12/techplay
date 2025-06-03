// ✅ middleware.js – Version finale PWA désactivée + fix manifest.json 401
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

const excludedPaths = [
  '/manifest.json',
  '/favicon.ico',
  '/robots.txt',
  '/firebase-messaging-sw.js',
  '/sitemap.xml',
  '/sitemap-0.xml',
  '/sw.js',
  '/serviceWorker.js'
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ✅ Autoriser statiques sans traitement
  if (
    excludedPaths.includes(pathname) ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|svg|webp|ico|json|xml|txt)$/)
  ) {
    return secureHeaders(request)
  }

  // ✅ Maintenance : redirige sauf admin
  const maintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = pathname === '/maintenance'

  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/maintenance'
    return NextResponse.redirect(redirectUrl)
  }

  // ✅ Auth admin uniquement sur pages non exclues
  if (isAdminPath && !pathname.match(/\.(json|xml|ico)$/)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const response = intlMiddleware(request)
  return secureHeaders(request, response)
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|manifest.json|firebase-messaging-sw.js|robots.txt|sitemap.xml|sitemap-0.xml|sw.js|serviceWorker.js|icons|images|fonts|.*\\..*).*)'
  ],
} 
