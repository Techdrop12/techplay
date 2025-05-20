'use client'

import { useEffect } from 'react'

export default function LiveChat() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://embed.tawk.to/TON_ID/1htxxxxxx' // ← ton vrai ID ici
    script.async = true
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    document.body.appendChild(script)
  }, [])

  return null
}
