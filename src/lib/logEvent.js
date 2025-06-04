// src/lib/logEvent.js
'use client'

export const logEvent = (action, params = {}) => {
  if (typeof window === 'undefined') return

  // Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, params)
  } else {
    console.warn('gtag non dispo :', action, params)
  }

  // Meta Pixel
  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', action, params)
  }

  // Internal debug (dev uniquement)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', action, params)
  }
}
