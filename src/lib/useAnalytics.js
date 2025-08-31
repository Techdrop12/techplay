// src/lib/useAnalytics.js — petit helper unifié (consent-aware + queue + multi-fournisseurs)
'use client'

import { useEffect } from 'react'

// File d’attente
const _queue = []

function _hasAnalyticsConsent() {
  try {
    const s = window.__consentState || {}
    const ok = s.analytics_storage !== 'denied'
    const ls = localStorage.getItem('consent:analytics') === '1'
    return ok || ls
  } catch { return false }
}
function _hasAdsConsent() {
  try {
    const s = window.__consentState || {}
    const ok = s.ad_storage !== 'denied' || s.ad_user_data !== 'denied' || s.ad_personalization !== 'denied'
    const ls = localStorage.getItem('consent:ads') === '1'
    return ok || ls
  } catch { return false }
}

function _flush() {
  if (typeof window === 'undefined') return
  while (_queue.length) {
    const { event, params } = _queue.shift()

    // GA / GTM (analytics)
    try {
      if (_hasAnalyticsConsent() && typeof window.gtag === 'function') {
        window.gtag('event', event, params)
      }
    } catch {}

    try {
      if (_hasAnalyticsConsent() && window.dataLayer && typeof window.dataLayer.push === 'function') {
        window.dataLayer.push({ event, ...(params || {}) })
      }
    } catch {}

    // Meta Pixel (ads)
    try {
      if (_hasAdsConsent() && typeof window.fbq === 'function') {
        // standard/custom : on utilise trackCustom pour rester générique
        window.fbq('trackCustom', event, params)
      }
    } catch {}

    // Microsoft Clarity (analytics)
    try {
      const clarity = window.clarity || window.Clarity
      if (_hasAnalyticsConsent() && typeof clarity === 'function') {
        clarity('event', event, params)
      }
    } catch {}

    // TikTok (si présent)
    try {
      const ttq = window.ttq
      if (_hasAdsConsent() && ttq && typeof ttq.track === 'function') ttq.track(event, params)
    } catch {}

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, params)
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', _flush)
  window.addEventListener('tp:consent', _flush)
}

/** Enqueue + tentative de flush immédiat */
export function track(event, params = {}) {
  if (!event) return
  _queue.push({ event, params })
  _flush()
}

/**
 * Hook minimal : déclenche l’évènement en changeant `event` ou `params`.
 * @param {string} event
 * @param {Record<string, any>} [params]
 */
export function useAnalytics(event, params = {}) {
  useEffect(() => {
    if (!event) return
    try { track(event, params) } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, JSON.stringify(params)])
}
