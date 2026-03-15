// src/lib/formatDate.ts
export type Dateish = Date | number | string

export function toDate(d: Dateish): Date {
  return d instanceof Date ? d : new Date(d)
}

export function formatDate(date: Dateish, locale = 'fr-FR', opts: Intl.DateTimeFormatOptions = {
  year: 'numeric', month: 'long', day: 'numeric',
}) {
  return new Intl.DateTimeFormat(locale, opts).format(toDate(date))
}

export function formatDateTime(date: Dateish, locale = 'fr-FR') {
  return formatDate(toDate(date), locale, {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatRelative(date: Dateish, locale = 'fr') {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const d = toDate(date).getTime()
  const diff = d - Date.now()
  const abs = Math.abs(diff)
  const minute = 60_000, hour = 3_600_000, day = 86_400_000
  if (abs < hour) return rtf.format(Math.round(diff / minute), 'minute')
  if (abs < day) return rtf.format(Math.round(diff / hour), 'hour')
  return rtf.format(Math.round(diff / day), 'day')
}

export function toISO(date: Dateish) {
  return toDate(date).toISOString()
}

export type TimeAgoLabels = {
  justNow: string
  min: (n: number) => string
  h: (n: number) => string
  d: (n: number) => string
}

/** Format relatif court pour avis/commentaires (« à l'instant », « 5 min », « 2 j »). Si labels fourni, il est utilisé (i18n). */
export function timeAgo(date: Dateish, locale = 'fr', labels?: TimeAgoLabels): string {
  const d = toDate(date).getTime()
  const diff = Date.now() - d
  const abs = Math.abs(diff)
  const minute = 60_000
  const hour = 3_600_000
  const day = 86_400_000
  if (abs < minute) return labels ? labels.justNow : locale === 'fr' ? "à l'instant" : 'just now'
  if (abs < hour) {
    const n = Math.round(diff / minute)
    return labels ? labels.min(n) : locale === 'fr' ? `${n} min` : `${n} min`
  }
  if (abs < day) {
    const n = Math.round(diff / hour)
    return labels ? labels.h(n) : locale === 'fr' ? `${n} h` : `${n}h`
  }
  const n = Math.round(diff / day)
  return labels ? labels.d(n) : locale === 'fr' ? `${n} j` : `${n}d`
}
