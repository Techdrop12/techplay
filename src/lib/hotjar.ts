export function initHotjar(id: number, version: number) {
  if (typeof window !== 'undefined') {
    (function (h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function () {
        (h.hj.q = h.hj.q || []).push(arguments)
      }
      h._hjSettings = { hjid: id, hjsv: version }
      a = o.getElementsByTagName('head')[0]
      r = o.createElement('script'); r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
  }
}
