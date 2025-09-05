// middleware.ts — Ultra Premium FINAL (i18n + root redirect + headers + en-alias rewrite)
import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'

/** ─────────────────────── Constantes ─────────────────────── **/
const SUPPORTED_LOCALES = ['fr', 'en'] as const
const DEFAULT_LOCALE = 'fr' as const
const LOCALE_COOKIE = 'NEXT_LOCALE'
const ADMIN_LOGIN_PATH = process.env.ADMIN_LOGIN_PATH || '/login'

const isDev = process.env.NODE_ENV !== 'production'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://techplay.example.com'
const CANONICAL_HOST = safeHostname(SITE_URL)
const EXTRA_ALLOWED = (process.env.ALLOWED_HOSTNAMES || '')
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

const STATIC_FILES = ['favicon.ico', 'manifest.json', 'robots.txt', 'sw.js', 'firebase-messaging-sw.js']

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

// ✅ Vraies routes localisées existantes sous /[locale]/... (à étendre au besoin)
const LOCALE_NATIVE_PREFIXES = ['/wishlist']

/** ─────────────────────── i18n (next-intl) ─────────────────────── **/
const intlMiddleware = createMiddleware({
  locales: SUPPORTED_LOCALES as unknown as string[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  // ❗️IMPORTANT: pas de détection Accept-Language côté next-intl (on gère nous-mêmes à la racine)
  localeDetection: false,
})

/** ──────────────────── Helpers réutilisables ─────────────────── **/
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
    sameSite: 'lax',
    secure: !isDev,
    maxAge: 60 * 60 * 24 * 30, // 30j
  })
}

/** Choix simple à partir d'Accept-Language (en priorité en, sinon fr) */
function bestFromAcceptLanguage(h?: string | null): 'fr' | 'en' {
  if (!h) return 'fr'
  try {
    const langs = h.split(',').map((s) => s.trim().split(';')[0].toLowerCase())
    for (const l of langs) {
      if (l.startsWith('en')) return 'en'
      if (l.startsWith('fr')) return 'fr'
    }
  } catch {}
  return 'fr'
}

/** Ajoute des valeurs au header Vary sans dupliquer ni écraser. */
function appendVary(res: NextResponse, values: string) {
  const prev = res.headers.get('Vary')
  const set = new Set<string>()
  if (prev) prev.split(',').forEach((v) => set.add(v.trim()))
  values.split(',').forEach((v) => set.add(v.trim()))
  res.headers.set('Vary', Array.from(set).join(', '))
}

/** En-têtes communs */
function setCommonHeaders(res: NextResponse, lang: 'fr' | 'en') {
  appendVary(res, 'Accept-Language, Cookie')
  res.headers.set('Content-Language', lang)
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noimageindex')
  }
  res.headers.set('X-DNS-Prefetch-Control', 'on')
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Content-Type-Options', 'nosniff')
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

  // ✅ 0-bis) Normaliser /fr → / (locale par défaut non préfixée)
  if (pathname === '/fr' || pathname.startsWith('/fr/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/^\/fr(\/|$)/, '/')
    return NextResponse.redirect(url, 308)
  }

  // ✅ 0-ter) Redirection racine -> locale (cookie > Accept-Language)
  if (pathname === '/') {
    const cookieLoc = request.cookies.get(LOCALE_COOKIE)?.value as 'fr' | 'en' | undefined
    const chosen = cookieLoc || bestFromAcceptLanguage(request.headers.get('accept-language'))
    if (chosen === 'en') {
      const url = request.nextUrl.clone()
      url.pathname = '/en'
      return NextResponse.redirect(url, 307)
    }
    // fr => on reste sur /
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
    url.hostname = CANONICAL_HOST // ✅ plus fiable que .host
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

  // 4-bis) ⭐ EN alias rewrite: /en/<path> → serve /<path> (URL reste /en/<path>),
  //        sauf pour les vraies routes localisées (ex: /en/wishlist)
  if (pathname.startsWith('/en/')) {
    const rest = pathname.slice(3) || '/'
    const restPath = rest.startsWith('/') ? rest : `/${rest}`
    const isNative = LOCALE_NATIVE_PREFIXES.some(
      (p) => restPath === p || restPath.startsWith(p + '/')
    )
    if (!isNative) {
      const url = request.nextUrl.clone()
      url.pathname = restPath
      const res = NextResponse.rewrite(url)
      // Fixe la locale à 'en' pour html[lang], headers & tracking
      res.cookies.set(LOCALE_COOKIE, 'en', {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        secure: !isDev,
      })
      setCommonHeaders(res, 'en')
      ensureAbCookie(res)
      return res
    }
  }

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
      url.pathname = ADMIN_LOGIN_PATH // ✅ /login par défaut
      return NextResponse.redirect(url, 307)
    }
  }

  // 7) i18n (next-intl) — sans détection Accept-Language
  const response = intlMiddleware(request) as NextResponse

  // ✅ 8) Fixer le cookie de locale selon le chemin courant
  //    - /en… => en, sinon fr (défaut)
  const derived = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'fr'
  if (request.cookies.get(LOCALE_COOKIE)?.value !== derived) {
    response.cookies.set(LOCALE_COOKIE, derived, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: !isDev,
    })
  }

  // 9) En-têtes dynamiques (SEO/CDN/Perf)
  setCommonHeaders(response, derived as 'fr' | 'en')

  if (
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/commande') ||
    pathname.startsWith('/success')
  ) {
    response.headers.set('Cache-Control', 'no-store')
  }

  // 10) AB test stickiness (optionnel)
  ensureAbCookie(response)

  return response
}

/** ───────────────────────── Matcher ───────────────────────── **/
export const config = {
  matcher: [
    '/((?!_next/|_vercel/|api/|favicon\\.ico$|robots\\.txt$|manifest\\.json$|site\\.webmanifest$|sw\\.js$|firebase-messaging-sw\\.js$|icons/|fr/icons/|en/icons/|images/|fonts/|static/).*)',
  ],
}
