import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ignorer certains chemins
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Si le chemin contient déjà une locale
  const locales = ['fr', 'en'];
  const pathnameParts = pathname.split('/');
  if (locales.includes(pathnameParts[1])) {
    return NextResponse.next();
  }

  // Détection automatique
  const acceptLang = request.headers.get('accept-language') || '';
  const preferredLocale = acceptLang.startsWith('fr') ? 'fr' : 'en';

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
