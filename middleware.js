import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'
import { createMiddleware } from 'next-intl/middleware'
import i18nConfig from './i18n.config.js'

// 🌍 Middleware de langue next-intl
const intlMiddleware = createMiddleware(i18nConfig)

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ✅ Ne pas bloquer les chemins techniques
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return secureHeaders(request)
  }

  // ✅ Maintenance activée (sauf admin, API et /maintenance)
  const maintenance = process.env.MAINTENANCE === 'true'
  const isMaintenancePage = pathname === '/maintenance'
  const isAdminPath = pathname.startsWith('/admin')

  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const maintenanceUrl = request.nextUrl.clone()
    maintenanceUrl.pathname = '/maintenance'
    return NextResponse.redirect(maintenanceUrl)
  }

  // ✅ Sécurité admin
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 🌍 Middleware next-intl + headers sécurité
  const response = intlMiddleware(request)
  return secureHeaders(request, response)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
