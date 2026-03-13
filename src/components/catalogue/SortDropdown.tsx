'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

type SortValue = 'asc' | 'desc' | 'alpha'

type Props = {
  sort: SortValue
  setSort: (value: SortValue) => void
  locale?: 'fr' | 'en'
}

const OPTIONS: { value: SortValue; labelFr: string; labelEn: string }[] = [
  { value: 'alpha', labelFr: 'Nom (A → Z)', labelEn: 'Name (A → Z)' },
  { value: 'asc', labelFr: 'Prix croissant', labelEn: 'Price: low to high' },
  { value: 'desc', labelFr: 'Prix décroissant', labelEn: 'Price: high to low' },
]

export default function SortDropdown({ sort, setSort, locale = 'fr' }: Props) {
  const groupId = useId()
  const isEn = locale === 'en'

  return (
    <div className="w-full rounded-[var(--radius-xl)] border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 p-4 md:min-w-0">
      <p
        id={`${groupId}-label`}
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-token-text/60"
      >
        {isEn ? 'Sort by' : 'Trier par'}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        className="flex flex-wrap gap-2"
      >
        {OPTIONS.map(({ value, labelFr, labelEn }) => {
          const active = sort === value
          const label = isEn ? labelEn : labelFr

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={label}
              onClick={() => setSort(value)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
                active
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-white shadow-[0_4px_14px_hsl(var(--accent)/.35)]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-token-text hover:border-[hsl(var(--accent)/.5)] hover:bg-[hsl(var(--surface-2))]'
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
