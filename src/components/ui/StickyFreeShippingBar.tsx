// src/components/ui/StickyFreeShippingBar.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import FreeShippingBadge from '@/components/FreeShippingBadge';
import Link from '@/components/LocalizedLink';
import { useCart } from '@/hooks/useCart';
import { UI } from '@/lib/constants';
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing';
import { cn } from '@/lib/utils';

type Position = 'bottom' | 'top';

type Props = {
  threshold?: number;
  autoShowDelayMs?: number;
  minScrollY?: number;
  dismissKey?: string;
  hideOnRoutes?: string[];
  position?: Position;
  showOnEmptyCart?: boolean;
  showWhenReached?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  policyHref?: string;
  className?: string;
};

type CartLikeItem = {
  price?: number;
  unitPrice?: number;
  quantity?: number;
  qty?: number;
  product?: {
    price?: number;
  };
};

function pushDL(event: string, extra?: Record<string, unknown>) {
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event, ...(extra ?? {}) });
  } catch {}
}

export default function StickyFreeShippingBar({
  threshold = UI.FREE_SHIPPING_THRESHOLD,
  autoShowDelayMs = 4000,
  minScrollY = 120,
  dismissKey = 'freeShippingBarDismissed',
  hideOnRoutes = ['/commande', '/checkout', '/success', '/cart'],
  position = 'bottom',
  showOnEmptyCart = false,
  showWhenReached = true,
  ctaHref = '/commande',
  ctaLabel,
  policyHref,
  className,
}: Props) {
  const pathname = usePathname() || '/';
  const locale = getCurrentLocale(pathname);
  const t = useTranslations('misc');
  const { cart } = useCart();

  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const shownOnceRef = useRef(false);
  const ticking = useRef(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(dismissKey) === '1') setDismissed(true);
    } catch {}
  }, [dismissKey]);

  const onClose = () => {
    try {
      localStorage.setItem(dismissKey, '1');
      pushDL('free_shipping_bar_close');
    } catch {}
    setVisible(false);
    setDismissed(true);
  };

  const hiddenByRoute = useMemo(
    () => hideOnRoutes.some((route) => pathname.startsWith(localizePath(route, locale))),
    [pathname, hideOnRoutes, locale]
  );

  const subtotal = useMemo(() => {
    if (!Array.isArray(cart)) return 0;

    return cart.reduce((sum: number, item: CartLikeItem) => {
      const price = Number(item.price ?? item.unitPrice ?? item.product?.price ?? 0);
      const qty = Number(item.quantity ?? item.qty ?? 1);

      const safePrice = Number.isFinite(price) ? price : 0;
      const safeQty = Number.isFinite(qty) ? qty : 1;

      return sum + safePrice * safeQty;
    }, 0);
  }, [cart]);

  const remaining = Math.max(threshold - subtotal, 0);
  const reached = remaining === 0;

  useEffect(() => {
    if (hiddenByRoute || dismissed) return;

    const check = () => {
      const y = window.scrollY;
      setVisible((prev) => prev || y > minScrollY);
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(check);
    };

    const timer = window.setTimeout(() => setVisible(true), autoShowDelayMs);

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [autoShowDelayMs, minScrollY, hiddenByRoute, dismissed]);

  useEffect(() => {
    if (!visible || shownOnceRef.current) return;
    shownOnceRef.current = true;
    pushDL('free_shipping_bar_show', { reached, subtotal, threshold });
  }, [visible, reached, subtotal, threshold]);

  const labelCart = ctaLabel ?? t('view_cart');

  if (dismissed || hiddenByRoute || !visible) return null;
  if (!showOnEmptyCart && subtotal <= 0) return null;
  if (!showWhenReached && reached) return null;

  const sideClasses =
    position === 'bottom'
      ? 'left-0 right-0 bottom-0 pb-[calc(env(safe-area-inset-bottom,0)+8px)] pt-2'
      : 'left-0 right-0 top-0 pt-[calc(env(safe-area-inset-top,0)+8px)] pb-2';

  return (
    <div
      className={cn('fixed z-50 px-3 sm:px-4', sideClasses, className)}
      style={{ pointerEvents: 'none' }}
      role="region"
      aria-label={t('free_shipping_bar_aria')}
      data-position={position}
    >
      <div
        className={cn(
          'mx-auto max-w-5xl rounded-2xl border border-[hsl(var(--border))] shadow-[var(--shadow-lg)]',
          'bg-[hsl(var(--surface))]/95 supports-[backdrop-filter]:backdrop-blur-xl'
        )}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex flex-col items-center justify-between gap-2 px-3 py-2.5 sm:flex-row sm:gap-4 sm:px-4">
          <FreeShippingBadge
            price={subtotal}
            threshold={threshold}
            withProgress
            variant="bar"
            policyHref={policyHref}
            persistKey="free_shipping_reached_session"
          />

          <div className="flex items-center gap-2">
            <Link
              href={localizePath(ctaHref, locale)}
              className={cn(
                'hidden items-center rounded-full px-4 py-2 text-[13px] font-semibold transition sm:inline-flex',
                reached
                  ? 'bg-emerald-500 text-emerald-950 shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)]'
                  : 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-sm)] hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2'
              )}
              aria-label={labelCart}
              onClick={() => pushDL('free_shipping_bar_cta', { reached })}
            >
              {labelCart}
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label={t('close_bar_aria')}
              className="rounded-full p-2 text-[13px] text-token-text/60 transition hover:bg-white/10 hover:text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
