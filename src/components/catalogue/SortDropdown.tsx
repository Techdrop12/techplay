'use client'

import { useId } from 'react'

import { cn } from '@/lib/utils'

type SortValue = 'asc' | 'desc' | 'alpha'

type Props = {
  sort: SortValue
  setSort: (value: SortValue) => void
  locale?: 'fr' | 'en'
  className?: string
}

const OPTIONS: { value: SortValue; labelFr: string; labelEn: string }[] = [
  { value: 'alpha', labelFr: 'Popularité', labelEn: 'Popularity' },
  { value: 'asc', labelFr: 'Prix croissant', labelEn: 'Price: low to high' },
  { value: 'desc', labelFr: 'Prix décroissant', labelEn: 'Price: high to low' },
]

export default function SortDropdown({ sort, setSort, locale = 'fr', className }: Props) {
  const groupId = useId()
  const isEn = locale === 'en'

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/95 px-4 py-3.5 sm:gap-3.5 sm:px-5 sm:py-4',
        className ?? 'w-full'
      )}
      role="group"
      aria-labelledby={`${groupId}-label`}
    >
      <p
        id={`${groupId}-label`}
        className="text-xs font-semibold uppercase tracking-[0.12em] text-token-text/70"
      >
        {isEn ? 'Sort by' : 'Trier par'}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        className="flex flex-wrap gap-2 sm:gap-2.5"
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
                'min-h-[2.75rem] shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition sm:min-h-0 sm:px-4 sm:py-2.5 sm:text-[14px]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]',
                active
                  ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[0_4px_16px_hsl(var(--accent)/.3)]'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-token-text hover:border-[hsl(var(--accent)/.4)] hover:bg-[hsl(var(--surface-2))]'
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
