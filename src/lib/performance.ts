// src/lib/performance.ts — router des Web Vitals vers analytics ou API
export type WebVitalMetric = {
name: string
value: number
id?: string
label?: string
}


export function reportWebVitals(metric: WebVitalMetric) {
try {
if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
;(window as any).gtag('event', metric.name, {
value: Math.round(metric.value),
event_category: 'Web Vitals',
event_label: metric.id || 'vital',
non_interaction: true,
})
}
// Optionnel : POST à une API route pour stockage serveur
if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
const body = JSON.stringify(metric)
navigator.sendBeacon('/api/vitals', body)
}
if (process.env.NODE_ENV === 'development') console.debug('[Perf]', metric.name, metric.value)
} catch {}
}