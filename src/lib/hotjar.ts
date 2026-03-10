/* src/lib/hotjar.ts */
// Éligibilité simple + SPA stateChange

export function eligibleHotjar(siteId: number): boolean {
  if (typeof window === 'undefined') return false
  if (!Number.isFinite(siteId) || siteId <= 0) return false

  const dnt =
    navigator.doNotTrack === '1' ||
    window.doNotTrack === '1' ||
    navigator.msDoNotTrack === '1'

  if (dnt) return false

  try {
    if (localStorage.getItem('hotjar:disabled') === '1') return false
    if (localStorage.getItem('analytics:disabled') === '1') return false
  } catch {
    // ignore storage access issues
  }

  return true
}

export function hjStateChange(path: string) {
  const safePath = typeof path === 'string' && path.trim() ? path : '/'

  try {
    if (typeof window.hj === 'function') {
      window.hj('stateChange', safePath)
    }
  } catch {
    // ignore Hotjar runtime issues
  }
}