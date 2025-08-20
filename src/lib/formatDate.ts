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
