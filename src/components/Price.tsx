// src/components/Price.tsx — composant unique, typé, i18n, a11y, SEO-friendly
'use client'

import * as React from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { formatPrice } from '@/lib/utils'

type Numeric = number | string

export type PriceProps = {
  /** Montant TTC (number ou string convertible) */
  amount: Numeric
  /** Devise ISO 4217 (ex: "EUR") */
  currency?: string
  /** Locale BCP 47 (ex: "fr-FR", "en-GB") */
  locale?: string
  /** Affiche un prix d’origine barré (ex: pour promos) */
  original?: Numeric
  /** Notation compacte (ex: 1,2 k €) */
  compact?: boolean
  /** Supprimer .00 inutiles selon la locale */
  stripZeros?: boolean
  /** Personnalisation */
  className?: string
  prefix?: ReactNode
  suffix?: ReactNode
  /** Contrôle des décimales */
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  /** A11y (étiquette explicite si besoin) */
  ariaLabel?: string
  /** Micro-données schema.org (si parent itemScope itemType=Offer/Product) */
  microdata?: boolean
} & Omit<HTMLAttributes<HTMLSpanElement>, 'children'>

function toNumber(value: Numeric | undefined | null): number | null {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    // Supporte "1 234,56" / "1 234,56" / "1234.56"
    const normalized = value.trim().replace(/\s| /g, '').replace(',', '.')
    const n = Number(normalized)
    return Number.isFinite(n) ? n : null
  }
  return null
}

export default function Price({
  amount,
  currency,
  locale,
  original,
  compact = false,
  stripZeros,
  className = '',
  prefix,
  suffix,
  minimumFractionDigits,
  maximumFractionDigits,
  ariaLabel,
  microdata = false,
  ...rest
}: PriceProps) {
  const numeric = toNumber(amount)
  if (numeric === null) {
    // Fallback robuste si montant invalide
    return (
      <span
        className={`inline-flex items-baseline text-sm text-muted-foreground ${className}`}
        aria-label={ariaLabel ?? 'Prix indisponible'}
        {...rest}
      >
        —
      </span>
    )
  }

  const origNumber = toNumber(original)

  // Formatage unifié via lib/formatPrice (SSR/CSR-safe + cache Intl)
  const formatted = formatPrice(numeric, {
    locale,
    currency,
    compact,
    minimumFractionDigits,
    maximumFractionDigits,
    stripZeros,
  })
  const formattedOriginal =
    origNumber !== null
      ? formatPrice(origNumber, {
          locale,
          currency,
          compact,
          minimumFractionDigits,
          maximumFractionDigits,
          stripZeros,
        })
      : null

  // a11y: annonce claire du prix, et de l’ancien si présent
  const defaultAria = formattedOriginal
    ? `Prix : ${formatted} (au lieu de ${formattedOriginal})`
    : `Prix : ${formatted}`
  const label = ariaLabel ?? defaultAria

  // Microdata: le contenu doit être un nombre en notation anglaise (point)
  const microPriceDigits =
    typeof maximumFractionDigits === 'number'
      ? maximumFractionDigits
      : typeof minimumFractionDigits === 'number'
      ? minimumFractionDigits
      : compact
      ? 1
      : 2
  const microPrice = numeric.toFixed(Math.max(0, Math.min(4, microPriceDigits)))
  const microCurrency = currency ?? undefined // si non fourni: laissé au parent/locale

  return (
    <span
      className={`inline-flex items-baseline gap-1 align-baseline ${className}`}
      aria-label={label}
      {...rest}
    >
      {microdata && (
        <>
          {/* À utiliser si le parent est itemScope Offer/Product */}
          {microCurrency ? <meta itemProp="priceCurrency" content={microCurrency} /> : null}
          <meta itemProp="price" content={microPrice} />
          {/* Autres props schema.org à gérer au parent : priceValidUntil, availability, etc. */}
        </>
      )}

      {prefix ? <span aria-hidden="true">{prefix}</span> : null}

      {formattedOriginal ? (
        <span
          className="text-sm line-through opacity-60"
          aria-label={`Prix d’origine : ${formattedOriginal}`}
        >
          {formattedOriginal}
        </span>
      ) : null}

      <span className="text-lg font-semibold tracking-tight">{formatted}</span>

      {suffix ? <span aria-hidden="true">{suffix}</span> : null}
    </span>
  )
}
