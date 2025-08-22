// middleware.ts — Ultra Premium FINAL
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'

/** ───────────────────────── I18N ───────────────────────── **/
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
})

/** ──────────────────── Constantes/Helpers ─────────────────── **/
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
  'sw.js',
  'firebase-messaging-sw.js',
]

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

const PUBLIC_PATHS = [...STATIC_FILES.flatMap((f) => [`/${f}`, `/fr/${f}`, `/en/${f}`])]

function safeHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/** Normalisation: enlève “//” multiples et trailing slash (sauf racine & /fr|/en) */
function normalizePath(pathname: string) {
  let p = pathname.replace(/\/{2,}/g, '/')
  if (p.length > 1 && /\/$/.test(p) && !/^\/(fr|en)\/?$/.test(p)) {
    p = p.slice(0, -1)
  }
  return p
}

/** Forçage HTTPS (hors dev/local) */
function mustEnforceHttps(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '')
  const host = req.headers.get('host') || req.nextUrl.host
  const isLocalhost = host?.startsWith('localhost') || host?.startsWith('127.0.0.1')
  return !isDev && !isLocalhost && proto !== 'https'
}

/** Redirection domaine canonique (conserve sous-domaines autorisés) */
function mustRedirectHost(host: string | null) {
  if (!host || !CANONICAL_HOST) return false
  if (host === CANONICAL_HOST) return false
  if (EXTRA_ALLOWED.includes(host)) return false
  if (host.endsWith('.vercel.app')) return false // preview autorisée
  return true
}

/** AB test cookie (stickiness), optionnel via env AB_TEST_ENABLED */
function ensureAbCookie(response: NextResponse) {
  if (process.env.AB_TEST_ENABLED !== 'true') return
  const has = response.cookies.get('ab')?.value
  if (has) return

  const variant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B'
  response.cookies.set('ab', variant, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax', // ← minuscule (fix typage)
    secure: !isDev,
    maxAge: 60 * 60 * 24 * 30, // 30j
  })
}

/** ───────────────────── Middleware principal ───────────────────── **/
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 0) Normalisation basique (doublons slash / trailing slash)
  const normalized = normalizePath(pathname)
  if (normalized !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = normalized
    return NextResponse.redirect(url, 308)
  }

  // 1) HTTPS obligatoire en prod
  if (mustEnforceHttps(request)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https'
    return NextResponse.redirect(url, 308)
  }

  // 2) Domaine canonique (hors preview vercel et hôtes autorisés)
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
    if (STATIC_FILES.includes(file) || file.startsWith('icons/')) {
      return NextResponse.rewrite(new URL(`/${file}`, request.url))
    }
  }

  // 4) Autoriser public paths/prefixes immédiatement
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // (⚠️ supprimé) 5) plus de redirection / -> /fr, car localePrefix:'as-needed'

  // 6) Maintenance (bypass pour /admin et page maintenance)
  const isMaintenance = process.env.MAINTENANCE === 'true'
  const isAdminPath = pathname.startsWith('/admin')
  const isMaintenancePage = ['/maintenance', '/fr/maintenance', '/en/maintenance'].includes(pathname)
  if (isMaintenance && !isAdminPath && !isMaintenancePage) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    return NextResponse.redirect(url, 307)
  }

  // 7) Admin: protection par JWT (rôle admin)
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || (token as any)?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/fr/connexion'
      return NextResponse.redirect(url, 307)
    }
  }

  // 8) i18n
  const response = intlMiddleware(request) as NextResponse

  // 9) En-têtes dynamiques
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

/** ───────────────────────── Matcher ─────────────────────────
 * Exclut Next internals, API, assets publics & fichiers statiques.
 * Laisse tout le reste passer dans le middleware (i18n inclus).
 */
export const config = {
  matcher: [
    '/((?!_next/|_vercel/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|site\\.webmanifest$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)',
  ],
}
