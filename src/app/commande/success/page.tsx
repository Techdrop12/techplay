// src/app/commande/success/page.tsx — SUCCESS (i18n, noindex)
import { getTranslations } from 'next-intl/server'

import type { Metadata } from 'next'

import Link from '@/components/LocalizedLink'
import PurchaseTrackerClient from './PurchaseTrackerClient'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo')
  return {
    title: t('success_title'),
    description: t('success_description'),
    robots: { index: false, follow: false },
  }
}

export default async function OrderSuccessPage({
  searchParams,
}: { searchParams: Promise<{ session_id?: string; mock?: string }> }) {
  const params = await searchParams
  const sess = params?.session_id
  const mock = params?.mock === '1'
  const t = await getTranslations('success_page')

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 sm:py-28" role="main" aria-labelledby="success-title">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 text-center shadow-[var(--shadow-lg)] sm:p-10">
        <h1 id="success-title" className="heading-page">
          {t('thank_you')}
        </h1>
        <p className="mt-3 text-[15px] text-token-text/75">
          {t('email_sent')}
        </p>
        <p className="mt-1 text-[13px] text-token-text/60">
          {t('delivery_info')}
        </p>

        <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))]/80 p-4 text-left">
          {mock ? (
            <p className="text-[13px] text-token-text/80">{t('demo_mode')}</p>
          ) : sess ? (
            <p className="text-[13px] text-token-text/80">
              {t('reference')} <code className="font-mono text-xs" title={sess}>{sess.length > 12 ? `…${sess.slice(-12)}` : sess}</code>
            </p>
          ) : (
            <p className="text-[13px] text-token-text/80">{t('session_unspecified')}</p>
          )}
        </div>

        <PurchaseTrackerClient sessionId={sess} mock={mock} />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[hsl(var(--accent))] px-6 py-3 text-[15px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-lg)] transition hover:opacity-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2"
          >
            {t('continue_shopping')}
          </Link>
          <Link
            href="/account/mes-commandes"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-6 py-3 text-[15px] font-semibold text-token-text transition hover:bg-[hsl(var(--surface))]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
          >
            {t('view_orders')}
          </Link>
        </div>
      </div>
    </main>
  )
}
