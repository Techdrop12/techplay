// src/lib/scroll.ts — unified scroll utilities (SSR-safe, a11y, perf)

/* ============================= SSR helpers ============================= */

const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof document !== 'undefined'

/* ====================== Motion / behavior preferences ====================== */

export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false
  if (!('matchMedia' in window)) return false
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

function resolveBehavior(custom?: ScrollBehavior): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : custom || 'smooth'
}

/* ============================ Basic scrolling ============================ */

export function scrollToTop(options: { behavior?: ScrollBehavior } = {}): void {
  if (!isBrowser()) return
  const behavior = resolveBehavior(options.behavior)
  window.scrollTo({ top: 0, behavior })
}

export function scrollToY(
  y: number,
  options: { behavior?: ScrollBehavior } = {}
): void {
  if (!isBrowser()) return
  const behavior = resolveBehavior(options.behavior)
  window.scrollTo({ top: Math.max(0, y || 0), behavior })
}

/* ============================ Persist position ============================ */

export function saveScrollPosition(key = 'scroll'): void {
  if (!isBrowser()) return
  try {
    sessionStorage.setItem(key, String(window.scrollY || 0))
  } catch {}
}

export function restoreScrollPosition(key = 'scroll', fallback = 0): void {
  if (!isBrowser()) return
  try {
    const y = Number(sessionStorage.getItem(key) ?? fallback)
    scrollToY(y)
  } catch {
    scrollToY(fallback)
  }
}

/* ============================ Snap to element ============================ */

export type ScrollToSnapOptions = {
  /** Décalage px (ex. hauteur du header sticky) */
  offset?: number
  /** Comportement du scroll */
  behavior?: ScrollBehavior
  /** Alignement vertical/horizontal pour scrollIntoView */
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
  /** Met le focus sur la cible après scroll (a11y) */
  focus?: boolean
  /** Conteneur scrollable custom (sélecteur CSS ou Element) */
  container?: string | Element
  /** Ajoute un highlight éphémère sur la cible */
  highlight?: boolean
}

function getElement(target: string | Element): Element | null {
  if (!isBrowser()) return null
  if (typeof target === 'string') {
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

  const resolvedBehavior = resolveBehavior(behavior)

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
      ;(root as any).scrollTo({ top, behavior: resolvedBehavior })
    } else {
      el.scrollIntoView({ behavior: resolvedBehavior, block, inline })
    }
  } else {
    if (offset) {
      const y = (window.scrollY || 0) + el.getBoundingClientRect().top - offset
      window.scrollTo({ top: y, behavior: resolvedBehavior })
    } else {
      el.scrollIntoView({ behavior: resolvedBehavior, block, inline })
    }
  }

  if (focus && el instanceof HTMLElement) {
    const prev = el.getAttribute('tabindex')
    if (prev === null) el.setAttribute('tabindex', '-1')
    try {
      el.focus({ preventScroll: true })
    } catch {}
    if (prev === null) el.removeAttribute('tabindex')
  }

  if (highlight && el instanceof HTMLElement && 'animate' in el) {
    try {
      el.animate(
        [
          { boxShadow: '0 0 0 0px rgba(99,102,241,0.0)' },
          { boxShadow: '0 0 0 6px rgba(99,102,241,0.28)' },
          { boxShadow: '0 0 0 0px rgba(99,102,241,0.0)' },
        ],
        { duration: 1000 }
      )
    } catch {}
  }

  return true
}

/* ============================ Direction / helpers ============================ */

export function isScrollingDown(lastY: number, currentY: number): boolean {
  return currentY > lastY
}

export type ScrollDirection = 'up' | 'down' | 'none'

export function getScrollDirection(
  lastY: number,
  currentY: number,
  threshold = 2
): ScrollDirection {
  const delta = currentY - lastY
  if (Math.abs(delta) <= threshold) return 'none'
  return delta > 0 ? 'down' : 'up'
}

export function isNearBottom(offset = 300): boolean {
  if (!isBrowser()) return false
  const { scrollY, innerHeight } = window
  const { scrollHeight } = document.documentElement
  return (scrollY + innerHeight) >= (scrollHeight - Math.max(0, offset))
}

/* ============================ Body lock (modals) ============================ */

export function lockBodyScroll(): void {
  if (!isBrowser()) return
  const scrollBar = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  if (scrollBar) document.body.style.paddingRight = `${scrollBar}px`
}

export function unlockBodyScroll(): void {
  if (!isBrowser()) return
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

/* ============================ Throttle util ============================ */

export function throttle<T extends (...args: any[]) => any>(fn: T, wait = 100) {
  let last = 0
  let timeout: any
  return (...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = wait - (now - last)
    if (remaining <= 0) {
      last = now
      fn(...args)
    } else {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        last = Date.now()
        fn(...args)
      }, remaining)
    }
  }
}
