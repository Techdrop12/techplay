// src/components/ui/DeliveryEstimate.tsx — premium (no emoji + i18n + a11y)
'use client'

import { useMemo } from 'react'

type Props = {
  /** Nombre de jours minimum avant livraison (par défaut 2) */
  minDays?: number
  /** Nombre de jours maximum avant livraison (par défaut 3) */
  maxDays?: number
  /** Compter uniquement les jours ouvrés (lun–ven) */
  businessDaysOnly?: boolean
  /** Classes utilitaires supplémentaires */
  className?: string
  /** Afficher l’icône camion */
  showIcon?: boolean
}

/** Ajoute n jours (option : seulement jours ouvrés) */
function addDays(base: Date, days: number, businessOnly: boolean) {
  const d = new Date(base)
  if (!businessOnly) {
    d.setDate(d.getDate() + days)
    return d
  }
  let left = Math.max(0, days)
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay() // 0 = dim, 6 = sam
    if (day !== 0 && day !== 6) left--
  }
  return d
}

function formatDate(d: Date, locale: string) {
  try {
    return d.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    })
  } catch {
    return d.toLocaleDateString()
  }
}

function TruckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M3 7a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v3h3.6a2 2 0 0 1 1.79 1.105l1.6 3.2A2 2 0 0 1 22 15v2a2 2 0 0 1-2 2h-1a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H3a2 2 0 0 1-2-2V7Zm2 10a1 1 0 1 0 2 0a1 1 0 0 0-2 0Zm10 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0ZM5 7v6h10V7Zm12 3h-2v3h5.382l-1.25-2.5A1 1 0 0 0 17 10Z"
      />
    </svg>
  )
}

export default function DeliveryEstimate({
  minDays = 2,
  maxDays = 3,
  businessDaysOnly = false,
  className = '',
  showIcon = true,
}: Props) {
  const locale =
    (typeof document !== 'undefined' && document.documentElement.lang) ||
    (typeof navigator !== 'undefined' && navigator.language) ||
    'fr-FR'

  const { minDateStr, maxDateStr, isRange } = useMemo(() => {
    const today = new Date()
    const minDate = addDays(today, Math.max(0, minDays), businessDaysOnly)
    const maxDate = addDays(today, Math.max(minDays, maxDays), businessDaysOnly)
    const minStr = formatDate(minDate, locale)
    const maxStr = formatDate(maxDate, locale)
    return {
      minDateStr: minStr,
      maxDateStr: maxStr,
      isRange: maxDate.toDateString() !== minDate.toDateString(),
    }
  }, [minDays, maxDays, businessDaysOnly, locale])

  return (
    <p
      className={[
        'flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300',
        className,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {showIcon && (
        <span
          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]"
          aria-hidden="true"
        >
          <TruckIcon />
        </span>
      )}
      <span>
        Livraison estimée :{' '}
        <strong>
          {isRange ? (
            <>
              {minDateStr} – {maxDateStr}
            </>
          ) : (
            minDateStr
          )}
        </strong>
        {businessDaysOnly && <span className="ml-1 text-xs opacity-70">(jours ouvrés)</span>}
      </span>
    </p>
  )
}
