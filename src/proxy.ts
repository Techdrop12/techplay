import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { DEFAULT_LOCALE } from '@/lib/language';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname?.replace(/\/+/g, '/').trim() || '';

  const isRoot = pathname === '' || pathname === '/';
  if (isRoot) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url, 307);
  }

  if (pathname.startsWith('/admin')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*'],
};
