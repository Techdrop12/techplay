// src/lib/hotjar.ts
// 🔥 Hotjar helpers (TS) — init idempotent + éligibilité + stateChange + opt-out

export type HotjarOptions = { id?: number; sv?: number; debug?: boolean }

const isBrowser = typeof window !== 'undefined'
const HOTJAR_ID_ENV = Number(process.env.NEXT_PUBLIC_HOTJAR_ID ?? 0)
const HOTJAR_SV_ENV = Number(process.env.NEXT_PUBLIC_HOTJAR_SV ?? 6)
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_HOTJAR_IN_DEV ?? '') === 'true'

/** Vrai si DNT/opt-out/consent bloquent le chargement. */
export function eligibleHotjar(id = HOTJAR_ID_ENV): boolean {
  if (!isBrowser) return false
  if (!id) return false

  // DNT
  const dnt =
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'

  // Opt-out local
  let optedOut = false
  try {
    optedOut =
      localStorage.getItem('hotjar:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
  } catch {}

  // Consent analytics requis
  let consentAnalytics = '0'
  try {
    consentAnalytics = localStorage.getItem('consent:analytics') || '0'
  } catch {}

  // Dev gating
  const isProd = process.env.NODE_ENV === 'production'

  return !dnt && !optedOut && (isProd || ENABLE_IN_DEV) && consentAnalytics === '1'
}

let injected = false

/** Initialise Hotjar côté client (idempotent). */
export function initHotjar(opts: HotjarOptions = {}) {
  if (!isBrowser) return
  if (injected) return

  const id = Number(opts.id ?? HOTJAR_ID_ENV)
  const sv = Number(opts.sv ?? HOTJAR_SV_ENV)
  if (!id || Number.isNaN(id)) {
    if (opts.debug) console.warn('[hotjar] id manquant')
    return
  }
  if (!eligibleHotjar(id)) return

  ;(function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
    if (h.hj) return
    h.hj =
      h.hj ||
      function () {
        (h.hj.q = h.hj.q || []).push(arguments)
      }
    h._hjSettings = { hjid: id, hjsv: sv }
    a = o.getElementsByTagName('head')[0]
    r = o.createElement('script')
    r.async = 1
    r.src = `${t}${h._hjSettings.hjid}.js?sv=${h._hjSettings.hjsv}`
    a.appendChild(r)
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')

  injected = true
}

/** Notifie Hotjar d’un changement de route (SPA). */
export function hjStateChange(path: string) {
  if (!isBrowser) return
  try {
    ;(window as any).hj?.('stateChange', path)
  } catch {}
}

/** Opt-out pratique (aligné avec le reste de l’app). */
export function setLocalHotjarEnabled(enabled: boolean) {
  if (!isBrowser) return
  try {
    if (enabled) {
      localStorage.removeItem('hotjar:disabled')
    } else {
      localStorage.setItem('hotjar:disabled', '1')
    }
  } catch {}
}

export default initHotjar
