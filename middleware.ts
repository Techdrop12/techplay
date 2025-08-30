// middleware.ts — Ultra Premium FINAL (i18n, sécurité, canonique, perf)
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'

/** ─────────────── I18N core (next-intl) ─────────────── **/
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
  localeDetection: false, // on garde le contrôle
})

/** ─────────────── Constantes/Helpers ─────────────── **/
const isDev = process.env.NODE_ENV !== 'production'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const CANONICAL_HOST = safeHostname(SITE_URL)
const EXTRA_ALLOWED = (process.env.ALLOWED_HOSTNAMES || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

const STATIC_FILES = [
  'favicon.ico',
  'manifest.json',
  'robots.txt',
  'site.webmanifest',
  'sw.js',
  'firebase-messaging-sw.js',
] as const

const PUBLIC_PREFIXES = [
  '/_next/',
  '/api/',
  '/images/',
  '/fonts/',
  '/static/',
  '/icons/',
  '/fr/icons/',
  '/en/icons/',
]

const PUBLIC_PATHS = new Set<string>([
  ...STATIC_FILES.flatMap((f) => [`/${f}`, `/fr/${f}`, `/en/${f}`]),
])

function safeHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/** Normalisation: // multiples & trailing slash (sauf racine & /fr|/en) */
function normalizePath(pathname: string) {
  let p = pathname.replace(/\/{2,}/g, '/')
  if (p.length > 1 && /\/$/.test(p) && !/^\/(fr|en)\/?$/.test(p)) {
    p = p.slice(0, -1)
  }
  // Harmonise /en/ → /en
  if (p === '/en/') p = '/en'
  return p
}

/** Forçage HTTPS (hors dev/local) */
function mustEnforceHttps(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '')
  const host = req.headers.get('host') || req.nextUrl.host
  const isLocalhost = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
  return !isDev && !isLocalhost && proto !== 'https'
}

/** Redirection domaine canonique (conserve hôtes autorisés & previews) */
function mustRedirectHost(host: string | null) {
  if (!host || !CANONICAL_HOST) return false
  if (host === CANONICAL_HOST) return false
  if (EXTRA_ALLOWED.includes(host)) return false
  if (host.endsWith('.vercel.app')) return false // previews autorisées
  return true
}

/** AB test cookie (stickiness), optionnel via env AB_TEST_ENABLED */
function ensureAbCookie(response: NextResponse) {
  if (process.env.AB_TEST_ENABLED !== 'true') return
  if (response.cookies.get('ab')?.value) return
  const variant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B'
  response.cookies.set('ab', variant, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    secure: !isDev,
    maxAge: 60 * 60 * 24 * 30, // 30j
  })
}

/** ─────────────── Middleware principal ─────────────── **/
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 0) Normalisation basique
  const normalized = normalizePath(pathname)
  if (normalized !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = normalized
    return NextResponse.redirect(url, 308)
  }

  // 0-bis) Normaliser /fr → / (locale par défaut non préfixée)
  if (pathname === '/fr' || pathname.startsWith('/fr/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/fr(\/|$)/, '/')
    return NextResponse.redirect(url, 308)
  }

  // 1) HTTPS obligatoire en prod
  if (mustEnforceHttps(request)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https'
    return NextResponse.redirect(url, 308)
  }

  // 2) Domaine canonique (hors previews & hôtes autorisés)
  const host = request.headers.get('host')
  if (!isDev && mustRedirectHost(host)) {
    const url = request.nextUrl.clone()
    url.host = CANONICAL_HOST
    return NextResponse.redirect(url, 308)
  }

  // 3) Static localisés -> réécriture vers racine publique
  const matchStatic = pathname.match(/^\/(fr|en)\/(.+)$/)
  if (matchStatic) {
    const [, , file] = matchStatic
    if (STATIC_FILES.includes(file as (typeof STATIC_FILES)[number]) || file.startsWith('icons/')) {
      return NextResponse.rewrite(new URL(`/${file}`, request.url))
    }
  }

  // 4) Autoriser public paths/prefixes immédiatement
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next()

  // 5) Maintenance (bypass pour /admin et page maintenance)
  const isMaintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = ['/maintenance', '/fr/maintenance', '/en/maintenance'].includes(pathname)
  if (isMaintenance && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.redirect(url, 307)
  }

  // 6) Admin: protection par JWT (rôle admin)
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || (token as any)?.role !== 'admin') {
      const url = request.nextUrl.clone()
      // ✅ correspond à ton arbo: /login existe à la racine
      url.pathname = '/login'
      return NextResponse.redirect(url, 307)
    }
  }

  // 7) i18n (next-intl) — sans Accept-Language
  const response = intlMiddleware(request) as NextResponse

  // 8) Cookie de locale selon chemin courant
  const derived = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr'
  if (request.cookies.get('NEXT_LOCALE')?.value !== derived) {
    response.cookies.set('NEXT_LOCALE', derived, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: !isDev,
    })
  }

  // 9) En-têtes dynamiques (SEO/CDN/Perf)
  response.headers.set('Vary', 'Accept-Language, Cookie')
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noimageindex')
  }
  if (
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/commande') ||
    pathname.startsWith('/success')
  ) {
    response.headers.set('Cache-Control', 'no-store')
  }
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')

  // 10) AB test stickiness (optionnel)
  ensureAbCookie(response)

  return response
}

/** ─────────────── Matcher ─────────────── **/
export const config = {
  matcher: [
    '/((?!_next/|_vercel/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|site\\.webmanifest$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)',
  ],
}
