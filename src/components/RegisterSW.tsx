// src/components/RegisterSW.tsx
'use client'
import { useEffect } from 'react'

export default function RegisterSW() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const url = '/sw.js'
    const doReg = async () => {
      try {
        const reg = await navigator.serviceWorker.register(url)
        setInterval(() => reg.update().catch(() => {}), 15 * 60 * 1000)
      } catch {}
    }
    doReg()
  }, [])
  return null
}
