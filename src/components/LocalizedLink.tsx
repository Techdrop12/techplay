'use client';

import NextLink, { type LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, useRef, useEffect, type AnchorHTMLAttributes } from 'react';

import { getCurrentLocale, localizePath, type Locale } from '@/lib/i18n-routing';

type NextHref = LinkProps['href'];

type Props = Omit<LinkProps, 'href' | 'locale'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: NextHref;
    locale?: Locale;
    keepQuery?: boolean;
    keepHash?: boolean;
  };

function isAbsolute(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function normalizeHref(
  href: NextHref,
  currentPathname: string,
  locale?: Locale,
  keepQuery = false,
  keepHash = false
): NextHref {
  const resolvedLocale = locale ?? getCurrentLocale(currentPathname);

  if (typeof href === 'string') {
    if (isAbsolute(href) || href.startsWith('#')) return href;
    return localizePath(href, resolvedLocale, { keepQuery, keepHash });
  }

  const nextHref: NextHref = { ...href };

  if (typeof href.pathname === 'string' && href.pathname.trim() && !isAbsolute(href.pathname)) {
    nextHref.pathname = localizePath(href.pathname, resolvedLocale);
  }

  return nextHref;
}

/** Convert Next href to full URL string for window.location.assign */
function hrefToAbsoluteUrl(href: NextHref): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  if (typeof href === 'string') {
    if (
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    )
      return href;
    return new URL(href, origin).href;
  }
  const path = href.pathname ?? '/';
  const q = href.query
    ? '?' + new URLSearchParams(href.query as Record<string, string>).toString()
    : '';
  const h = href.hash ?? '';
  return new URL(path + q + h, origin).href;
}

/** Only use fallback for same-origin / relative links */
function isInternalLink(href: NextHref): boolean {
  if (typeof href === 'string') {
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (
      /^https?:\/\//i.test(href) &&
      typeof window !== 'undefined' &&
      !href.startsWith(window.location.origin)
    )
      return false;
    return true;
  }
  return true;
}

const FALLBACK_NAV_DELAY_MS = 420;
const NAV_START_EVENT = 'nextjs:nav-start';

const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(function LocalizedLink(
  { href, locale, keepQuery = false, keepHash = false, onClick, prefetch, ...rest },
  ref
) {
  const pathname = usePathname() || '/';
  const finalHref = normalizeHref(href, pathname, locale, keepQuery, keepHash);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetUrlRef = useRef<string | null>(null);

  // Cancel fallback when client-side navigation succeeds (pathname changes)
  useEffect(() => {
    return () => {
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      targetUrlRef.current = null;
    };
  }, [pathname]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isInternalLink(finalHref)) {
      try {
        window.dispatchEvent(new CustomEvent(NAV_START_EVENT));
      } catch {}
    }
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!isInternalLink(finalHref)) return;

    const targetUrl = hrefToAbsoluteUrl(finalHref);
    targetUrlRef.current = targetUrl;
    if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    fallbackTimeoutRef.current = setTimeout(() => {
      fallbackTimeoutRef.current = null;
      try {
        if (
          typeof window !== 'undefined' &&
          targetUrlRef.current &&
          window.location.href !== targetUrlRef.current
        ) {
          window.location.assign(targetUrlRef.current);
        }
      } finally {
        targetUrlRef.current = null;
      }
    }, FALLBACK_NAV_DELAY_MS);
  };

  return (
    <NextLink
      ref={ref}
      href={finalHref}
      onClick={handleClick}
      prefetch={prefetch ?? true}
      {...rest}
    />
  );
});

LocalizedLink.displayName = 'LocalizedLink';

export default LocalizedLink;
