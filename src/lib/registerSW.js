// src/lib/registerSW.js — enregistre un Service Worker avec gestion d’updates
export function registerSW(path = '/firebase-messaging-sw.js', options = {}) {
if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null


const register = () =>
navigator.serviceWorker
.register(path, { scope: '/', type: 'classic', ...options })
.then((reg) => {
if (process.env.NODE_ENV === 'development') console.info('[SW] registered', reg.scope)
// Auto-reload à l’update (optionnel)
reg.onupdatefound = () => {
const installing = reg.installing
if (!installing) return
installing.onstatechange = () => {
if (installing.state === 'installed' && navigator.serviceWorker.controller) {
if (process.env.NODE_ENV === 'development') console.info('[SW] update installed')
}
}
}
return reg
})
.catch((e) => console.warn('[SW] registration failed', e))


if (document.readyState === 'complete') return register()
window.addEventListener('load', register)
return null
}