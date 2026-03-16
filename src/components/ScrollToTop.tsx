// src/components/ScrollToTop.tsx
'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ScrollToTopProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  threshold?: number;
  positionClassName?: string;
  ariaLabel?: string;
  highContrast?: boolean;
}

export default function ScrollToTop({
  threshold = 320,
  positionClassName = 'bottom-6 right-6',
  ariaLabel,
  highContrast = false,
  className,
  ...props
}: ScrollToTopProps) {
  const tAria = useTranslations('aria');
  const [visible, setVisible] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onScroll = () => {
      if (rafRef.current != null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        setVisible(window.scrollY > threshold);

        if (rafRef.current != null) {
          window.cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [threshold]);

  if (!visible) return null;

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollTop}
      className={cn(
        'fixed z-50 inline-grid h-11 w-11 place-items-center rounded-full shadow-[var(--shadow-md)] outline-none transition active:scale-95',
        'scroll-top-entrance',
        'focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2',
        highContrast
          ? 'bg-[hsl(var(--text))] text-[hsl(var(--bg))] hover:opacity-90 dark:bg-[hsl(var(--text))] dark:text-[hsl(var(--bg))]'
          : 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] hover:opacity-90',
        positionClassName,
        className
      )}
      aria-label={ariaLabel ?? tAria('scroll_top')}
      title={ariaLabel ?? tAria('scroll_top')}
      {...props}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 5l7 7-1.4 1.4L13 8.8V20h-2V8.8L6.4 13.4 5 12z" fill="currentColor" />
      </svg>
    </button>
  );
}
