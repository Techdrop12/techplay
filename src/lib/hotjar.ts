// src/lib/hotjar.ts
/**
 * Initialise Hotjar côté client sans doublons.
 * Utilise NEXT_PUBLIC_HOTJAR_ID si id non passé.
 */
export type HotjarOptions = { id?: number; sv?: number; debug?: boolean }

let injected = false
export function initHotjar(opts: HotjarOptions = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (injected) return

  const id = Number(opts.id ?? process.env.NEXT_PUBLIC_HOTJAR_ID)
  const sv = Number(opts.sv ?? 6)
  if (!id || Number.isNaN(id)) {
    if (opts.debug) console.warn('[hotjar] id manquant')
    return
  }

  ;(function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
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
export default initHotjar
