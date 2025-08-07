// lib/ga.ts
// 📊 Google Analytics v4 – Tracking complet avec typage et fallback

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// ✅ Suivi de page (pageview)
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// ✅ Suivi d’événements standards (catégorisés)
interface GAEvent {
  action: string
  category: string
  label: string
  value: number
}

export const event = ({ action, category, label, value }: GAEvent) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    })
  }
}

// ✅ Suivi d’événements personnalisés (libres)
export const logEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams)
  }
}
