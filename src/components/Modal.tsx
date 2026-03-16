'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showClose?: boolean;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  describedById?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  className?: string;
  overlayClassName?: string;
  container?: HTMLElement | null;
}

const SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-none h-[100dvh] sm:h-auto sm:max-w-3xl',
};

let bodyLockCount = 0;
let previousBodyOverflow = '';

function lockBodyScroll(lock: boolean) {
  if (typeof document === 'undefined') return;

  if (lock) {
    if (bodyLockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    bodyLockCount += 1;
    return;
  }

  bodyLockCount = Math.max(0, bodyLockCount - 1);

  if (bodyLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = '';
  }
}

function useFocusTrap(
  active: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  initialFocusRef?: React.RefObject<HTMLElement | null>
) {
  React.useEffect(() => {
    if (!active) return;

    const node = containerRef.current;
    if (!node) return;

    const selector =
      'a[href],area[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

    const getFocusable = () =>
      Array.from(node.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
      );

    const focusInitial = () => {
      const list = getFocusable();
      const target = initialFocusRef?.current ?? list[0] ?? node;
      window.setTimeout(() => target.focus(), 0);
    };

    focusInitial();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const list = getFocusable();
      if (list.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }

      const first = list[0];
      const last = list[list.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef, initialFocusRef]);
}

function ModalRoot({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlay = true,
  closeOnEsc = true,
  showClose = true,
  lockScroll = true,
  trapFocus = true,
  describedById,
  className,
  overlayClassName,
  initialFocusRef,
}: ModalProps) {
  const tAria = useTranslations('aria');
  const overlayRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const titleId = React.useId();
  const labelledBy = title ? `modal-title-${titleId}` : undefined;

  React.useEffect(() => {
    if (!lockScroll) return;
    if (isOpen) lockBodyScroll(true);
    return () => lockBodyScroll(false);
  }, [isOpen, lockScroll]);

  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeOnEsc, onClose]);

  useFocusTrap(isOpen && trapFocus, panelRef, initialFocusRef);

  if (!isOpen) return null;

  const handleOverlayMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!closeOnOverlay) return;
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayMouseDown}
      className={cn(
        'fixed inset-0 z-[100] grid place-items-center p-4',
        'bg-black/50 backdrop-blur-sm',
        'motion-safe:transition-opacity motion-safe:duration-200',
        overlayClassName
      )}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedById}
        tabIndex={-1}
        className={cn(
          'relative w-full outline-none',
          SIZES[size],
          'rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text))] shadow-[var(--shadow-lg)]',
          'modal-panel-entrance',
          className
        )}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={tAria('close_modal')}
            className="absolute right-3.5 top-3.5 inline-grid h-9 w-9 place-items-center rounded-full
                       text-token-text/70 hover:text-[hsl(var(--text))]
                       hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {title ? (
          <div className="px-6 pt-6 pb-3">
            <h2 id={labelledBy} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
          </div>
        ) : null}

        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pt-6 pb-3">{children}</div>;
}

function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6 pt-4', className)}>{children}</div>;
}

function Footer({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pb-6 pt-3 border-t border-[hsl(var(--border))]">{children}</div>;
}

const Modal = Object.assign(
  function Modal(props: ModalProps) {
    const [mounted, setMounted] = React.useState(false);
    const triggerRef = React.useRef<HTMLElement | null>(null);

    React.useEffect(() => setMounted(true), []);

    React.useEffect(() => {
      if (!mounted) return;

      if (props.isOpen) {
        triggerRef.current = document.activeElement as HTMLElement | null;
      } else if (props.restoreFocus !== false) {
        triggerRef.current?.focus?.();
        triggerRef.current = null;
      }
    }, [mounted, props.isOpen, props.restoreFocus]);

    if (!mounted) return null;

    const container = props.container ?? document.body;
    return ReactDOM.createPortal(<ModalRoot {...props} />, container);
  },
  {
    Header,
    Body,
    Footer,
  }
);

export default Modal;
