// src/lib/scroll.ts
export function prefersReducedMotion() {
if (typeof window === 'undefined') return false
return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}


export function scrollToTop(options: { behavior?: ScrollBehavior } = {}) {
const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : options.behavior || 'smooth'
if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior })
}


export function scrollToY(y: number, options: { behavior?: ScrollBehavior } = {}) {
const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : options.behavior || 'smooth'
if (typeof window !== 'undefined') window.scrollTo({ top: Math.max(0, y), behavior })
}


export function saveScrollPosition(key = 'scroll') {
if (typeof sessionStorage === 'undefined' || typeof window === 'undefined') return
sessionStorage.setItem(key, String(window.scrollY))
}


export function restoreScrollPosition(key = 'scroll', fallback = 0) {
if (typeof sessionStorage === 'undefined' || typeof window === 'undefined') return
const y = Number(sessionStorage.getItem(key) || fallback)
scrollToY(y)
}