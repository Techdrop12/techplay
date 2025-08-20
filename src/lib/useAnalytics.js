// src/lib/useAnalytics.js
'use client'


import { useEffect } from 'react'


// Filet de sécurité : file d’attente + flush multi‑fournisseurs
const _queue = []


function _flush() {
if (typeof window === 'undefined') return
while (_queue.length) {
const { event, params } = _queue.shift()
try { if (typeof window.gtag === 'function') window.gtag('event', event, params) } catch {}
try { if (typeof window.fbq === 'function') window.fbq('trackCustom', event, params) } catch {}
try { if (window.dataLayer && typeof window.dataLayer.push === 'function') window.dataLayer.push({ event, ...params }) } catch {}
try { if (typeof window.Clarity === 'function') window.Clarity('event', event, params) } catch {}
try {
const ttq = window.ttq
if (ttq && typeof ttq.track === 'function') ttq.track(event, params)
} catch {}
if (process.env.NODE_ENV === 'development') console.debug('[analytics]', event, params)
}
}


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