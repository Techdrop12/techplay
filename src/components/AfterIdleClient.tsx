// src/components/AfterIdleClient.tsx — FINAL
'use client'

import { ReactNode, useEffect, useState } from 'react'

export default function AfterIdleClient({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const ric: any = (window as any).requestIdleCallback ?? ((cb: any) => setTimeout(cb, 1))
    const id = ric(() => setReady(true))
    return () => {
      (window as any).cancelIdleCallback?.(id)
      clearTimeout(id)
    }
  }, [])

  if (!ready) return null
  return <>{children}</>
}
