'use client'

import { useId } from 'react'
import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils'

type SortValue = 'asc' | 'desc' | 'alpha'

type Props = {
  sort: SortValue
  setSort: (value: SortValue) => void
  /** @deprecated Locale is read from next-intl; prop kept for backward compatibility */
  locale?: 'fr' | 'en'
  className?: string
}

const OPTIONS: { value: SortValue; key: string }[] = [
  { value: 'alpha', key: 'popularity' },
  { value: 'asc', key: 'price_asc' },
  { value: 'desc', key: 'price_desc' },
]

export default function SortDropdown({ sort, setSort, locale: _locale, className }: Props) {
  const groupId = useId()
  const t = useTranslations('sort')

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
        {t('label')}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        className="flex flex-wrap gap-2 sm:gap-2.5"
      >
        {OPTIONS.map(({ value, key }) => {
          const active = sort === value
          const label = t(key)

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
