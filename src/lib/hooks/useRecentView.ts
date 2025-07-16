import { useEffect } from 'react'

export function useRecentView(id: string) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewed = JSON.parse(localStorage.getItem('recentViews') || '[]')
      const updated = [...new Set([id, ...viewed])].slice(0, 10)
      localStorage.setItem('recentViews', JSON.stringify(updated))
    }
  }, [id])
}
