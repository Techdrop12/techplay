'use client'

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    _brevo?: { track: (...args: any[]) => void }
  }
}

type LogParams = {
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: any
}

export function logEvent({ action, category, label, value, ...rest }: LogParams) {
  if (typeof window === 'undefined') return

  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
      ...rest,
    })
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', action, {
      category,
      label,
      value,
      ...rest,
    })
  }

  if (typeof window._brevo === 'object' && action === 'newsletter_signup') {
    window._brevo.track('event', {
      label,
      ...rest,
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[logEvent] (dev only)', { action, category, label, value, ...rest })
  }
}
