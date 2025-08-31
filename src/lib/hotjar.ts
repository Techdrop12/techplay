// src/lib/hotjar.ts
// 🔥 Hotjar helpers (TS) — FINAL++++
// - Éligibilité complète (DNT, opt-out, consent __consentState + LS, gating dev)
// - Init idempotente (no double-inject, HMR safe)
// - SPA stateChange helper
// - Opt-out local & strict reload option

export type HotjarOptions = {
  id?: number
  sv?: number
  debug?: boolean
}

declare global {
  interface Window {
    hj?: (...args: any[]) => void
    _hjSettings?: { hjid: number; hjsv: number }
    __consentState?: Record<string, 'granted' | 'denied'>
    __HOTJAR_INJECTED__?: boolean
  }
}

const isBrowser = typeof window !== 'undefined'
const HOTJAR_ID_ENV = Number(process.env.NEXT_PUBLIC_HOTJAR_ID ?? 0)
const HOTJAR_SV_ENV = Number(process.env.NEXT_PUBLIC_HOTJAR_SV ?? 6)
const ENABLE_IN_DEV = (process.env.NEXT_PUBLIC_HOTJAR_IN_DEV || '').toLowerCase() === 'true'
const STRICT_RELOAD = (process.env.NEXT_PUBLIC_HOTJAR_STRICT_RELOAD || '').toLowerCase() === '1'

/* ------------------------------- Internes ------------------------------- */

function logDebug(...args: any[]) {
  if ((process.env.NEXT_PUBLIC_DEBUG_ANALYTICS || '').toLowerCase() === 'true') {
    // eslint-disable-next-line no-console
    console.debug('[hotjar]', ...args)
  }
}

function isDntOn(): boolean {
  if (!isBrowser) return false
  return (
    (navigator as any).doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'
  )
}

function optedOutLocally(): boolean {
  if (!isBrowser) return false
  try {
    return (
      localStorage.getItem('hotjar:disabled') === '1' ||
      localStorage.getItem('analytics:disabled') === '1'
    )
  } catch {
    return false
  }
}

/** Analytics ok si consent GA (Consent Mode) OU fallback LS de la bannière. */
function analyticsConsentGranted(): boolean {
  if (!isBrowser) return false
  try {
    const s: any = (window as any).__consentState || {}
    const modeOk = s.analytics_storage === 'granted'
    const lsOk = localStorage.getItem('consent:analytics') === '1'
    return modeOk || lsOk
  } catch {
    return false
  }
}

/* ------------------------------ Public API ------------------------------ */

/** Vrai si DNT/opt-out/consent/gating bloquent le chargement. */
export function eligibleHotjar(id = HOTJAR_ID_ENV): boolean {
  if (!isBrowser) return false
  if (!id) return false
  const isProd = process.env.NODE_ENV === 'production'
  const ok =
    !isDntOn() &&
    !optedOutLocally() &&
    analyticsConsentGranted() &&
    (isProd || ENABLE_IN_DEV)
  logDebug('eligible?', ok, {
    id,
    dnt: isDntOn(),
    optedOut: optedOutLocally(),
    consent: analyticsConsentGranted(),
    env: process.env.NODE_ENV,
  })
  return ok
}

let injected = false

/** Initialise Hotjar côté client (idempotent). */
export function initHotjar(opts: HotjarOptions = {}) {
  if (!isBrowser) return
  if (injected || window.__HOTJAR_INJECTED__) {
    logDebug('init skipped (already injected)')
    return
  }

  const id = Number(opts.id ?? HOTJAR_ID_ENV)
  const sv = Number(opts.sv ?? HOTJAR_SV_ENV)

  if (!id || Number.isNaN(id)) {
    if (opts.debug) console.warn('[hotjar] id manquant ou invalide') // eslint-disable-line no-console
    return
  }

  if (!eligibleHotjar(id)) {
    logDebug('not eligible, skip inject')
    return
  }

  // Snippet officiel, rendu idempotent
  ;(function (h: any, o: any, t: string, j: string, a?: any, r?: any) {
    if (h.hj) return
    h.hj = function () { (h.hj.q = h.hj.q || []).push(arguments) }
    h._hjSettings = { hjid: id, hjsv: sv }
    a = o.getElementsByTagName('head')[0]
    r = o.createElement('script')
    r.async = 1
    r.src = `${t}${h._hjSettings.hjid}${j}${h._hjSettings.hjsv}`
    a.appendChild(r)
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')

  injected = true
  window.__HOTJAR_INJECTED__ = true
  logDebug('injected', { id, sv })
}

/** Notifie Hotjar d’un changement de route (SPA). */
export function hjStateChange(path: string) {
  if (!isBrowser) return
  try {
    window.hj?.('stateChange', path)
    logDebug('stateChange', path)
  } catch {}
}

/** Opt-out local (aligne avec le reste de l’app). */
export function setLocalHotjarEnabled(enabled: boolean) {
  if (!isBrowser) return
  try {
    if (enabled) {
      localStorage.removeItem('hotjar:disabled')
    } else {
      localStorage.setItem('hotjar:disabled', '1')
      // Si on veut être strict, on recharge pour cesser toute collecte
      if (STRICT_RELOAD) {
        try { location.reload() } catch {}
      }
    }
  } catch {}
}

/** Helper pratique si tu veux réévaluer après consentement côté app. */
export function recheckAndMaybeInit(opts?: HotjarOptions) {
  if (!isBrowser) return
  if (eligibleHotjar(opts?.id ?? HOTJAR_ID_ENV)) {
    initHotjar(opts)
  }
}

export default initHotjar
