'use client'

export const logEvent = (action, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params)
  } else {
    console.warn('gtag non dispo pour logEvent:', action, params)
  }
}
