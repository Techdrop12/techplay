import createMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'

// ✅ Inline i18n config ici directement
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
})

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // ⛔ Exclure fichiers techniques
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return secureHeaders(request)
  }

  // 🔧 Maintenance (hors admin/api/maintenance)
  const maintenance = process.env.MAINTENANCE === 'true'
  const isMaintenancePage = pathname === '/maintenance'
  const isAdminPath = pathname.startsWith('/admin')

  if (maintenance && !isAdminPath && !isMaintenancePage) {
    const maintenanceUrl = request.nextUrl.clone()
    maintenanceUrl.pathname = '/maintenance'
    return NextResponse.redirect(maintenanceUrl)
  }

  // 🔐 Protection admin
  if (isAdminPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 🌍 i18n + headers sécurisés
  const response = intlMiddleware(request)
  return secureHeaders(request, response)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
