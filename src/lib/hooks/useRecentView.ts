// /src/lib/hooks/useRecentView.ts
// Enregistre la vue d’un produit (dedupe, max N, sync onglets)
import { useEffect } from 'react'

type Options = {
  key?: string
  max?: number
}

export function useRecentView (id: string, opts: Options = {}) {
  useEffect(() => {
    if (!id || typeof window === 'undefined') return
    const key = opts.key ?? 'recentViews'
    const max = Math.max(1, opts.max ?? 10)
    try {
      const raw = localStorage.getItem(key) || '[]'
      const arr = Array.isArray(JSON.parse(raw)) ? (JSON.parse(raw) as string[]) : []
      const updated = [id, ...arr.filter((x) => x !== id)].slice(0, max)
      localStorage.setItem(key, JSON.stringify(updated))
      // event pour composants/onglets qui souhaitent réagir
      window.dispatchEvent(new CustomEvent('recent-views-updated', { detail: updated }))
    } catch {
      // no-op
    }
  }, [id, opts.key, opts.max])
}
