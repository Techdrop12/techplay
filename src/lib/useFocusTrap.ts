'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href],area[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[tabindex]:not([tabindex="-1"]),[contenteditable="true"]'

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
  )
}

/**
 * Piège le focus dans le conteneur (pour modales/dialogs).
 * Au montage : sauvegarde l’élément actif et focus le premier focusable ou initialRef.
 * Au démontage : restaure le focus sur l’élément sauvegardé.
 */
type Options = {
  initialFocusRef?: RefObject<HTMLElement | null>
  restoreFocus?: boolean
}

export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options?: Options
) {
  const previousActiveRef = useRef<Element | null>(null)
  const restoreFocus = options?.restoreFocus !== false
  const initialFocusRef = options?.initialFocusRef

  useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    previousActiveRef.current = document.activeElement as Element | null

    const list = getFocusable(container)
    const target = initialFocusRef?.current ?? list[0] ?? container
    const timer = window.setTimeout(() => {
      try {
        (target as HTMLElement).focus()
      } catch {
        // no-op
      }
    }, 0)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusables = getFocusable(container)
      if (focusables.length === 0) {
        e.preventDefault()
        container.focus()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', onKeyDown)
      if (restoreFocus && previousActiveRef.current instanceof HTMLElement) {
        try {
          previousActiveRef.current.focus()
        } catch {
          // no-op
        }
      }
    }
  }, [active, containerRef, restoreFocus, initialFocusRef])
}
