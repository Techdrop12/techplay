'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, type ReactNode } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Optional label for the panel (accessibility) */
  ariaLabel?: string;
}

export default function SlideOverPanel({ open, onClose, children, ariaLabel }: SlideOverPanelProps) {
  const t = useTranslations('aria');
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const target = closeRef.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? panelRef.current;
    target?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const node = panelRef.current;
      if (!node) return;
      const list = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
      );
      if (list.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      <div
        className="fixed inset-0 bg-black/30"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={-1}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? t('side_panel')}
        className="relative ml-auto bg-[hsl(var(--surface))] w-80 max-w-[calc(100vw-2rem)] shadow-[var(--shadow-lg)] p-4 pt-14 overflow-y-auto border-l border-[hsl(var(--border))] min-h-full"
        style={{ paddingTop: 'max(3.5rem, calc(env(safe-area-inset-top) + 2.5rem))' }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 flex h-11 w-11 min-w-[2.75rem] items-center justify-center rounded-lg text-token-text/50 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
          aria-label={t('close_panel')}
        >
          <span aria-hidden>✕</span>
        </button>
        {children}
      </div>
    </div>
  );
}
