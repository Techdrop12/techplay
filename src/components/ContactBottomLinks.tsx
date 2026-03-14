'use client'

import { useTranslations } from 'next-intl'

import BackToHomeLink from '@/components/BackToHomeLink'
import Link from '@/components/LocalizedLink'

export default function ContactBottomLinks() {
  const t = useTranslations('common')

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <Link
        href="/#faq"
        prefetch={false}
        className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--surface-2))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
      >
        {t('see_faq')}
      </Link>
      <BackToHomeLink variant="outline" prefetch={false} className="!min-h-0 py-2 text-[13px]" />
    </div>
  )
}
