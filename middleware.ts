import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import intlConfig from './next-intl.config'

const { defaultLocale, locales } = intlConfig

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
})

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  // Headers de sécurité avancés
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
  matcher: ['/((?!_next|favicon.ico|icons|manifest.json|sw.js).*)']
}
