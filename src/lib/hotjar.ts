/* src/lib/hotjar.ts */
// Éligibilité simple + SPA stateChange

declare global {
  interface Window {
    hj?: (...args:unknown[]) => void
  }
}

export function eligibleHotjar(siteId: number): boolean {
  if (!siteId || typeof window === "undefined") return false
  const dnt =
    (navigator as unknown).doNotTrack === "1" ||
    (window as unknown).doNotTrack === "1" ||
    (navigator as unknown).msDoNotTrack === "1"
  if (dnt) return false
  try {
    if (localStorage.getItem("hotjar:disabled") === "1") return false
    if (localStorage.getItem("analytics:disabled") === "1") return false
  } catch {}
  return true
}

export function hjStateChange(path: string) {
  try { window.hj && window.hj("stateChange", path) } catch {}
}

