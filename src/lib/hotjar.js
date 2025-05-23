import { useEffect } from 'react'

export default function useHotjar() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_HOTJAR_ID) return

    (function(h,o,t,j,a,r){
      h.hj = h.hj || function(){(h.hj.q = h.hj.q || []).push(arguments)}
      h._hjSettings={hjid:parseInt(process.env.NEXT_PUBLIC_HOTJAR_ID),hjsv:6}
      a = o.getElementsByTagName('head')[0]
      r = o.createElement('script'); r.async=1
      r.src=t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
  }, [])
}
