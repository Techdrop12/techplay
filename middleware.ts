import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
})

// Liste des fichiers statiques publics (pour les langues)
const STATIC_FILES = [
  'favicon.ico',
  'manifest.json',
  'robots.txt',
  'sw.js',
  'firebase-messaging-sw.js'
]

// Middleware principal
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ Redirection des fichiers statiques localisés
  const matchStatic = pathname.match(/^\/(fr|en)\/(.+)$/)
  if (matchStatic) {
    const [, , file] = matchStatic
    if (STATIC_FILES.includes(file) || file.startsWith('icons/')) {
      return NextResponse.rewrite(new URL(`/${file}`, request.url))
    }
  }

  // ✅ Autoriser tout ce qui est public
  const PUBLIC_PATHS = [
    ...STATIC_FILES.flatMap(f => [`/${f}`, `/fr/${f}`, `/en/${f}`])
  ]
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()

  const PUBLIC_PREFIXES = [
    '/_next/', '/api/', '/images/', '/fonts/', '/static/',
    '/icons/', '/fr/icons/', '/en/icons/'
  ]
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // ✅ Redirection / vers /fr
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/fr'
    return NextResponse.redirect(url)
  }

  // 🚧 Mode maintenance activable par variable d’environnement
  const isMaintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = ['/maintenance', '/fr/maintenance', '/en/maintenance'].includes(pathname)

  if (isMaintenance && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.redirect(url)
  }

  // 🔐 Protection des routes /admin via JWT + rôle
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/fr/connexion'
      return NextResponse.redirect(url)
    }
  }

  // 🌐 Middleware de langue (i18n)
  const response = intlMiddleware(request)

  // 🛡️ Headers de sécurité avancés
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')

  return response
}

export const config = {
  matcher: [
    '/((?!_next/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)'
  ]
}
