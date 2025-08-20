// src/lib/scrollSnap.ts

export type ScrollToSnapOptions = {
  /** Décalage en pixels (ex. hauteur du header sticky) */
  offset?: number
  /** Comportement du scroll */
  behavior?: ScrollBehavior
  /** Alignement vertical */
  block?: ScrollLogicalPosition
  /** Alignement horizontal */
  inline?: ScrollLogicalPosition
  /** Met le focus sur la cible après scroll (a11y) */
  focus?: boolean
  /** Conteneur scrollable custom (sélecteur CSS ou Element) */
  container?: string | Element
  /** Ajoute un highlight éphémère sur la cible */
  highlight?: boolean
}

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined'

function getElement(target: string | Element): Element | null {
  if (typeof target === 'string') {
    // accepte "id", "#id" ou tout sélecteur CSS
    const id = target.startsWith('#') ? target.slice(1) : target
    return (
      document.getElementById(id) ||
      document.querySelector(target) ||
      null
    )
  }
  return target ?? null
}

export function scrollToSnap(
  target: string | Element,
  opts: ScrollToSnapOptions = {}
): boolean {
  if (!isBrowser()) return false

  const {
    offset = 0,
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    focus = false,
    container,
    highlight = false,
  } = opts

  const el = getElement(target)
  if (!el) return false

  // Scroll dans un conteneur custom si fourni
  if (container) {
    const root =
      typeof container === 'string'
        ? (document.querySelector(container) as Element | null)
        : container
    if (root && 'scrollTop' in (root as any)) {
      const rect = el.getBoundingClientRect()
      const rootRect = (root as Element).getBoundingClientRect()
      const top = (root as any).scrollTop + (rect.top - rootRect.top) - offset
      ;(root as any).scrollTo({ top, behavior })
    } else {
      el.scrollIntoView({ behavior, block, inline })
    }
  } else {
    if (offset) {
      const y = window.scrollY + el.getBoundingClientRect().top - offset
      window.scrollTo({ top: y, behavior })
    } else {
      el.scrollIntoView({ behavior, block, inline })
    }
  }

  if (focus && el instanceof HTMLElement) {
    const prev = el.getAttribute('tabindex')
    if (prev === null) el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
    if (prev === null) el.removeAttribute('tabindex')
  }

  if (highlight && el instanceof HTMLElement) {
    el.animate(
      [
        { boxShadow: '0 0 0 0px rgba(99,102,241,0.0)' },
        { boxShadow: '0 0 0 6px rgba(99,102,241,0.3)' },
        { boxShadow: '0 0 0 0px rgba(99,102,241,0.0)' },
      ],
      { duration: 1000 }
    )
  }

  return true
}

export default scrollToSnap
