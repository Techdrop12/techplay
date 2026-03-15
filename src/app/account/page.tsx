import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import AccountLogoutButton from '@/components/account/AccountLogoutButton'
import Link from '@/components/LocalizedLink'
import { getSession } from '@/lib/auth'
import { getUserOrders } from '@/lib/db/orders'
import { formatDateTime } from '@/lib/formatDate'
import { formatPrice } from '@/lib/utils'

type OrderSummary = {
  id: string
  date?: string | number | Date
  total?: number
  itemsCount?: number
  status?: string
}

export const metadata: Metadata = {
  title: 'Espace client – TechPlay',
  description: 'Accédez à vos commandes, suivez vos livraisons et gérez votre compte TechPlay.',
  robots: { index: false, follow: false },
}

type OrderDoc = { _id?: { toString: () => string }; createdAt?: unknown; total?: number; items?: unknown[]; status?: string }

function firstName(name: string | null | undefined): string {
  if (!name || typeof name !== 'string') return ''
  const part = name.trim().split(/\s+/)[0]
  return part || ''
}

const ICONS = {
  profile: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  orders: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  contact: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  ),
  shop: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  wishlist: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  paid: 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))]',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  canceled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export default async function AccountPage() {
  const t = await getTranslations('account')
  const session = await getSession()
  const isLoggedIn = Boolean(session?.user?.email?.trim())
  const email = session?.user?.email?.trim() ?? ''
  const userName = session?.user?.name ?? null
  const userImage = session?.user?.image ?? null
  const displayName = firstName(userName) || 'Client'

  const STATUS_LABEL: Record<string, string> = {
    pending: t('status_pending'),
    paid: t('status_paid'),
    shipped: t('status_shipped'),
    delivered: t('status_delivered'),
    canceled: t('status_canceled'),
  }

  const QUICK_LINKS = [
    { href: '/account/profil', titleKey: 'link_my_profile' as const, descKey: 'link_my_profile_desc' as const, icon: ICONS.profile },
    { href: '/account/mes-commandes', titleKey: 'link_my_orders' as const, descKey: 'link_my_orders_desc' as const, icon: ICONS.orders },
    { href: '/contact', titleKey: 'link_contact' as const, descKey: 'link_contact_desc' as const, icon: ICONS.contact },
    { href: '/products', titleKey: 'link_shop' as const, descKey: 'link_shop_desc' as const, icon: ICONS.shop },
    { href: '/wishlist', titleKey: 'link_wishlist' as const, descKey: 'link_wishlist_desc' as const, icon: ICONS.wishlist },
  ]

  let orders: OrderSummary[] = []
  let totalSpent = 0
  let lastOrderDate: string | null = null

  if (isLoggedIn && email) {
    const raw = await getUserOrders(email) as OrderDoc[]
    orders = raw.map((o: OrderDoc) => ({
      id: o._id?.toString() ?? '',
      date: o.createdAt as string | number | Date | undefined,
      total: o.total ?? undefined,
      itemsCount: Array.isArray(o.items) ? o.items.length : 0,
      status: o.status ?? undefined,
    }))
    totalSpent = orders.reduce((sum, o) => sum + (typeof o.total === 'number' ? o.total : 0), 0)
    if (orders.length > 0 && orders[0].date) {
      lastOrderDate = formatDateTime(orders[0].date, 'fr-FR')
    }
  }

  const recentOrders = orders.slice(0, 3)

  if (!isLoggedIn) {
    return (
      <main
        className="container-app mx-auto max-w-2xl px-4 pt-24 pb-20 sm:px-6"
        role="main"
        aria-labelledby="account-title"
      >
        <header className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(var(--accent))]">
            {t('overview')}
          </p>
          <h1 id="account-title" className="heading-page mt-2">
            {t('page_title')}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-token-text/75">
            {t('page_subtitle')}
          </p>
        </header>

        <section
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] card-padding shadow-[var(--shadow-md)]"
          aria-labelledby="login-cta-heading"
        >
          <h2 id="login-cta-heading" className="sr-only">
            {t('login_cta_heading')}
          </h2>
          <ul className="mb-8 space-y-4 text-left" aria-label={t('benefits_aria')}>
            <li className="flex items-center gap-3 text-[15px] text-token-text/85">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {t('benefit_orders')}
            </li>
            <li className="flex items-center gap-3 text-[15px] text-token-text/85">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {t('benefit_history')}
            </li>
            <li className="flex items-center gap-3 text-[15px] text-token-text/85">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {t('benefit_support')}
            </li>
          </ul>
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-8 py-4 text-[16px] font-semibold text-[hsl(var(--accent-fg))] shadow-[var(--shadow-md)] transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
            >
              {t('sign_in')}
            </Link>
            <p className="mt-4 text-[13px] text-token-text/60">
              {t('guest_note')}
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main
      className="container-app mx-auto max-w-5xl px-4 pt-24 pb-20 sm:px-6"
      role="main"
      aria-labelledby="account-title"
    >
      {/* Welcome + profile */}
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--surface-2))] ring-2 ring-[hsl(var(--accent)/0.3)]">
            {userImage ? (
              <img
                src={userImage}
                alt=""
                className="h-full w-full object-cover"
                width={56}
                height={56}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-bold text-[hsl(var(--accent))]">
                {displayName.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div>
            <h1 id="account-title" className="heading-page text-2xl sm:text-3xl">
              {t('hello', { name: displayName })}
            </h1>
            <p className="mt-0.5 text-[14px] text-token-text/70">{email}</p>
          </div>
        </div>
        <AccountLogoutButton className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] px-4 py-2.5 text-[14px] font-medium text-token-text/80 transition hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--text))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2" />
      </header>

      {/* Stats */}
      <section aria-label={t('activity_summary')} className="mb-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-token-text/60">Commandes</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[hsl(var(--text))]">{orders.length}</p>
            <p className="mt-0.5 text-[13px] text-token-text/60">passées sur TechPlay</p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-token-text/60">Dernière commande</p>
            <p className="mt-1 text-lg font-semibold text-[hsl(var(--text))]">
              {lastOrderDate ?? '—'}
            </p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-token-text/60">Total commandé</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[hsl(var(--accent))]">
              {formatPrice(totalSpent)}
            </p>
          </div>
        </div>
      </section>

      {/* Dernières commandes */}
      {recentOrders.length > 0 && (
        <section className="mb-10" aria-labelledby="recent-orders-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-orders-heading" className="heading-subsection">
              {t('recent_orders_heading')}
            </h2>
            <Link
              href="/account/mes-commandes"
              className="text-[14px] font-medium text-[hsl(var(--accent))] transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 rounded"
            >
              {t('see_all_history')}
            </Link>
          </div>
          <ul className="space-y-3" role="list">
            {recentOrders.map((order) => {
              const statusKey = (order.status ?? '').toLowerCase()
              const statusLabel = (STATUS_LABEL[statusKey] || order.status) ?? '—'
              const badgeClass = STATUS_STYLE[statusKey] ?? 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text))]'
              return (
                <li key={order.id}>
                  <Link
                    href={`/account/mes-commandes/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.04)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[hsl(var(--text))]">#{order.id}</span>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-[13px] text-token-text/60">
                        {order.date ? formatDateTime(order.date, 'fr-FR') : '—'}
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums text-[hsl(var(--text))]">
                      {typeof order.total === 'number' ? formatPrice(order.total) : '—'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Quick actions */}
      <section className="mb-10" aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="heading-subsection mb-4">
          {t('quick_links_heading')}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {QUICK_LINKS.map(({ href, titleKey, descKey, icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5 transition hover:border-[hsl(var(--accent))] hover:shadow-[var(--shadow-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]">
                  {icon}
                </span>
                <div>
                  <span className="font-semibold text-[hsl(var(--text))]">{t(titleKey)}</span>
                  <p className="mt-0.5 text-[13px] text-token-text/70">{t(descKey)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Aide */}
      <section
        className="rounded-2xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--surface))]/50 px-5 py-5 sm:px-6"
        aria-labelledby="help-heading"
      >
        <h2 id="help-heading" className="text-sm font-semibold uppercase tracking-wider text-token-text/60">
          {t('help_heading')}
        </h2>
        <p className="mt-2 text-[14px] text-token-text/75">
          {t('help_intro')}{' '}
          <Link href="/contact" className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline">
            {t('contact_support')}
          </Link>
          {' '}{t('help_mid')}{' '}
          <Link href="/#faq" className="font-medium text-[hsl(var(--accent))] underline-offset-2 hover:underline" prefetch={false}>
            {t('faq_link')}
          </Link>
          {t('help_end')}
        </p>
      </section>
    </main>
  )
}
