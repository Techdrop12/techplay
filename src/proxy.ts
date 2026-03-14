import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

import { DEFAULT_LOCALE } from '@/lib/language'

/**
 * Redirige la racine "/" vers la locale par défaut "/fr" pour un routage i18n cohérent.
 * Les routes /fr et /en sont gérées par app/[locale]/...
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname?.replace(/\/+/g, '/').trim() || ''
  const isRoot = pathname === '' || pathname === '/'
  if (isRoot) {
    const url = request.nextUrl.clone()
    url.pathname = `/${DEFAULT_LOCALE}`
    return NextResponse.redirect(url, 307)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
