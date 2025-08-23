// src/components/Modal.tsx
'use client'

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cn } from '@/lib/utils'

/* ============================ Types & API ============================ */

export interface ModalProps {
  /** Ouverture du modal */
  isOpen: boolean
  /** Fermeture (overlay, ESC, bouton X) */
  onClose: () => void
  /** Titre accessible (affiche un header si fourni) */
  title?: React.ReactNode
  /** Corps du modal (ou utiliser <Modal.Body/>) */
  children?: React.ReactNode
  /** Taille visuelle */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Autorise la fermeture par clic overlay (true par défaut) */
  closeOnOverlay?: boolean
  /** Autorise la fermeture via ESC (true par défaut) */
  closeOnEsc?: boolean
  /** Affiche le bouton “X” */
  showClose?: boolean
  /** No scroll body (par défaut true) */
  lockScroll?: boolean
  /** Restaure le focus sur l’élément déclencheur à la fermeture (true) */
  restoreFocus?: boolean
  /** Active le piégeage du focus (true) */
  trapFocus?: boolean
  /** id aria-describedby si contenu externe */
  describedById?: string
  /** ref à focusser à l’ouverture (si absent, focus auto) */
  initialFocusRef?: React.RefObject<HTMLElement>
  /** Classes supplémentaires */
  className?: string
  overlayClassName?: string
  /** Portail sur un conteneur spécifique (sinon document.body) */
  container?: HTMLElement | null
}

/* ============================ Constantes ============================ */

const SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-none h-[100dvh] sm:h-auto sm:max-w-3xl',
}

let bodyLockCount = 0
function lockBodyScroll(lock: boolean) {
  if (typeof document === 'undefined') return
  if (lock) {
    if (bodyLockCount === 0) {
      const { overflow } = document.body.style
      ;(document.body as any).__prevOverflow = overflow
      document.body.style.overflow = 'hidden'
    }
    bodyLockCount++
  } else {
    bodyLockCount = Math.max(0, bodyLockCount - 1)
    if (bodyLockCount === 0) {
      const prev = (document.body as any).__prevOverflow as string | undefined
      document.body.style.overflow = prev ?? ''
      ;(document.body as any).__prevOverflow = undefined
    }
  }
}

/* ============================ Focus Trap ============================ */

function useFocusTrap(
  active: boolean,
  containerRef: React.RefObject<HTMLElement>,
  initialFocusRef?: React.RefObject<HTMLElement>
) {
  React.useEffect(() => {
    if (!active) return
    const node = containerRef.current
    if (!node) return

    // focus initial
    const focusFirst = () => {
      // éléments focusables calculés à la volée (gère contenu dynamique)
      const sel =
        'a[href],area[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'
      const list = Array.from(node.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
      )
      const first = list[0]
      const toFocus = initialFocusRef?.current ?? first ?? node
      setTimeout(() => toFocus?.focus?.(), 0)
    }
    focusFirst()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const sel =
        'a[href],area[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'
      const list = Array.from(node.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
      )
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          ;(last ?? node).focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          ;(first ?? node).focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, containerRef, initialFocusRef])
}

/* ============================ Modal panel ============================ */

const ModalRoot = React.forwardRef<HTMLDivElement, ModalProps>(function ModalRoot(
  {
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
  },
  _ref
) {
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const titleId = React.useId()
  const labelledBy = title ? `modal-title-${titleId}` : undefined

  // Lock scroll
  React.useEffect(() => {
    if (!lockScroll) return
    if (isOpen) lockBodyScroll(true)
    return () => lockBodyScroll(false)
  }, [isOpen, lockScroll])

  // ESC
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeOnEsc, onClose])

  // Focus trap
  useFocusTrap(isOpen && trapFocus, panelRef, initialFocusRef)

  if (!isOpen) return null

  const handleOverlayMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!closeOnOverlay) return
    if (e.target === overlayRef.current) onClose()
  }

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
        className={cn(
          'relative w-full',
          SIZES[size],
          'rounded-2xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-2xl',
          'motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out',
          'motion-safe:opacity-100 motion-safe:scale-100',
          'outline-none',
          className
        )}
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre modale"
            className="absolute right-3.5 top-3.5 inline-grid h-9 w-9 place-items-center rounded-full
                       text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
                       hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

        <div className="px-6 pb-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  )
})

/* ---------- Subcomponents (Header/Body/Footer) ---------- */

function Header({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pt-6 pb-3">{children}</div>
}
function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6 pt-4', className)}>{children}</div>
}
function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 pb-6 pt-3 border-t border-black/10 dark:border-white/10">
      {children}
    </div>
  )
}

/* ============================ Wrapper (portal + restore focus) ============================ */

const Modal: React.FC<ModalProps> & { Header: typeof Header; Body: typeof Body; Footer: typeof Footer } =
  ((props: ModalProps) => {
    const [mounted, setMounted] = React.useState(false)
    const triggerRef = React.useRef<HTMLElement | null>(null)

    React.useEffect(() => setMounted(true), [])

    // Mémorise l’élément actif à l’ouverture et restaure à la fermeture
    React.useEffect(() => {
      if (!mounted) return
      if (props.isOpen) {
        triggerRef.current = (document.activeElement as HTMLElement) ?? null
      } else if (props.restoreFocus !== false) {
        triggerRef.current?.focus?.()
        triggerRef.current = null
      }
    }, [mounted, props.isOpen, props.restoreFocus])

    if (!mounted) return null
    const container = props.container ?? document.body
    return ReactDOM.createPortal(<ModalRoot {...props} />, container)
  }) as any

Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer

export default Modal
