import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import { middleware as secureHeaders } from './middleware-security'

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const locales = ['fr', 'en']
  const pathnameParts = pathname.split('/')

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

  // ✅ Locale déjà présente → on laisse passer
  if (locales.includes(pathnameParts[1])) {
    return secureHeaders(request)
  }

  // ✅ Sinon : redirection vers langue détectée
  const acceptLang = request.headers.get('accept-language') || ''
  const preferredLocale = acceptLang.startsWith('fr') ? 'fr' : 'en'

  const url = request.nextUrl.clone()
  url.pathname = `/${preferredLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
