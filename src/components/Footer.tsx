'use client'

import { usePathname } from 'next/navigation'
import {
  useId,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import { toast } from 'react-hot-toast'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLock,
  FaFileAlt,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
} from 'react-icons/fa'

import Link from '@/components/LocalizedLink'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

type FooterLink = { label: string; href: string; external?: boolean }
type NavGroup = { title: string; links: FooterLink[] }

interface FooterProps {
  groups?: NavGroup[]
  links?: FooterLink[]
  companyName?: string
  compact?: boolean
  children?: ReactNode
  subscribeEndpoint?: string
  siteUrl?: string
  contact?: {
    email?: string
    phone?: string
    address?: {
      streetAddress?: string
      postalCode?: string
      addressLocality?: string
      addressCountry?: string
    }
  }
}

type FooterWindow = Window & {
  tpOpenConsent?: () => void
  dataLayer?: Array<Record<string, unknown>>
}

type SubscribeResponse = {
  message?: string
}

const DEFAULT_LEGAL: FooterLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Préférences cookies', href: '#cookies' },
]

const normalizeHref = (href: string): string => {
  if (!href || !href.startsWith('/')) return href

  return href
    .replace(/^\/produit(?!s)/, '/products')
    .replace(/^\/pack(?!s)/, '/products/packs')
    .replace(/^\/promo$/, '/products?promo=1')
    .replace(/^\/#?categories$/i, '/#categories')
    .replace(/^\/#?faq$/i, '/#faq')
}

const DEFAULT_GROUPS: NavGroup[] = [
  {
    title: 'Boutique',
    links: [
      { label: 'Accueil', href: '/' },
      { label: 'Catégories', href: '/#categories' },
      { label: 'Produits', href: '/products' },
      { label: 'Packs', href: '/products/packs' },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Suivi de commande', href: '/commande' },
      { label: 'Blog', href: '/blog' },
      { label: 'Promo du jour', href: '/products?promo=1' },
    ],
  },
  {
    title: 'Légal',
    links: DEFAULT_LEGAL,
  },
]

function isValidEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(String(value || '').trim())
}

function getSafeWindow(): FooterWindow | null {
  if (typeof window === 'undefined') return null
  return window as FooterWindow
}

function pushDataLayer(eventName: string, payload: Record<string, unknown> = {}): void {
  try {
    const w = getSafeWindow()
    if (!w) return
    if (!Array.isArray(w.dataLayer)) w.dataLayer = []
    w.dataLayer.push({ event: eventName, ...payload })
  } catch {}
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return fallback
}

function LegalIcon({ label }: { label: string }) {
  const lower = label.toLowerCase()

  if (lower.includes('mention')) {
    return <FaFileAlt className="text-[hsl(var(--accent))]" aria-hidden="true" />
  }
  if (lower.includes('confidential')) {
    return <FaLock className="text-[hsl(var(--accent))]" aria-hidden="true" />
  }
  if (lower.includes('cgv')) {
    return <FaFileAlt className="text-[hsl(var(--accent))]" aria-hidden="true" />
  }

  return null
}

export default function Footer({
  groups = DEFAULT_GROUPS,
  links,
  companyName = 'TechPlay',
  compact = false,
  children,
  subscribeEndpoint = '/api/notifications/subscribe',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://techplay.example.com',
  contact = {
    email: 'support@techplay.fr',
    phone: '+33 1 84 80 12 34',
    address: {
      streetAddress: '12 rue de la Boutique',
      postalCode: '75000',
      addressLocality: 'Paris',
      addressCountry: 'FR',
    },
  },
}: FooterProps) {
  const pathname = usePathname() || '/'
  const rawLocale = getCurrentLocale(pathname)
  const locale: 'fr' | 'en' = rawLocale === 'en' ? 'en' : 'fr'
  const origin = String(siteUrl || '').replace(/\/$/, '')

  const navGroups = useMemo<NavGroup[]>(() => {
    const normalizeGroup = (group: NavGroup): NavGroup => ({
      title: group.title,
      links: group.links.map((link) => ({
        ...link,
        href: normalizeHref(link.href),
      })),
    })

    const base = groups.map(normalizeGroup)

    if (!links) return base

    const normalizedLegal = links.map((link) => ({
      ...link,
      href: normalizeHref(link.href),
    }))

    const clone = [...base]
    const index = clone.findIndex((group) => group.title.toLowerCase().includes('légal'))

    if (index >= 0) {
      clone[index] = {
        title: clone[index].title,
        links: normalizedLegal,
      }
    } else {
      clone.push({ title: 'Légal', links: normalizedLegal })
    }

    return clone
  }, [groups, links])

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const emailId = useId()
  const msgId = useId()
  const consentId = useId()

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [consent, setConsent] = useState(true)

  const openConsentManager = (
    e?: Pick<ReactMouseEvent<HTMLElement>, 'preventDefault'> | { preventDefault?: () => void }
  ) => {
    e?.preventDefault?.()

    try {
      const w = getSafeWindow()
      w?.tpOpenConsent?.()
    } catch {}

    try {
      window.dispatchEvent(new CustomEvent('open-consent-manager'))
    } catch {}

    pushDataLayer('open_consent_manager', { location: 'footer' })
  }

  const onSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (status === 'loading') return
    if (website) return

    if (!isValidEmail(email)) {
      setStatus('error')
      setMessage('Merci d’entrer une adresse email valide.')
      return
    }

    if (!consent) {
      setStatus('error')
      setMessage('Vous devez accepter la politique de confidentialité.')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(subscribeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale, pathname }),
      })

      if (!res.ok) {
        const maybe = (await res.json().catch(() => null)) as SubscribeResponse | null
        throw new Error(maybe?.message || 'Erreur API')
      }

      pushDataLayer('newsletter_subscribe', {
        location: 'footer',
        locale,
        pathname,
      })

      setStatus('success')
      setMessage('Inscription confirmée. Bienvenue chez TechPlay !')
      setEmail('')

      try {
        toast.success('Vous êtes inscrit(e) 🎉')
      } catch {}
    } catch (error: unknown) {
      setStatus('error')
      setMessage(getErrorMessage(error, 'Une erreur est survenue. Réessayez.'))

      try {
        toast.error('Inscription impossible pour le moment')
      } catch {}
    }
  }

  const onSocialClick = (network: 'facebook' | 'twitter' | 'instagram') => {
    pushDataLayer('social_click', {
      network,
      location: 'footer',
      pathname,
    })
  }

  const onNavClick = (
    groupTitle: string,
    label: string,
    href: string,
    e?: ReactMouseEvent<HTMLElement>
  ) => {
    if (label.toLowerCase().includes('cookie')) {
      openConsentManager(e)
      return
    }

    pushDataLayer('footer_nav_click', {
      group: groupTitle,
      label,
      href,
      from: pathname,
    })
  }

  return (
    <footer
      className="relative overflow-hidden border-t border-token-border bg-token-surface text-token-text"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-20%,rgba(37,99,235,0.08),transparent),radial-gradient(800px_400px_at_10%_120%,rgba(16,185,129,0.06),transparent)]"
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-screen-xl px-6 pb-6 pt-12">
        <h2 className="sr-only" id="footer-heading">
          Informations et navigation secondaire
        </h2>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="space-y-5 md:col-span-5">
            <p className="text-xl font-extrabold tracking-tight">
              <span className="text-brand dark:text-white">{companyName}</span>
              <span className="text-[hsl(var(--accent))]">.</span>
            </p>

            <p className="text-sm leading-relaxed text-token-text/70">
              Des accessoires et packs sélectionnés pour la performance, l’innovation et le style.
            </p>

            {!compact && (
              <>
                <ul className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaShieldAlt className="text-emerald-500" aria-hidden="true" />
                    Paiement sécurisé
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaTruck className="text-[hsl(var(--accent))]" aria-hidden="true" />
                    Liv. 48–72h
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaHeadset className="text-amber-400" aria-hidden="true" />
                    Support 7j/7
                  </li>
                </ul>

                <div className="flex items-center gap-3 pt-1 text-2xl text-token-text/60">
                  <FaCcVisa aria-label="Visa" />
                  <FaCcMastercard aria-label="Mastercard" />
                  <FaCcPaypal aria-label="PayPal" />
                </div>
              </>
            )}

            <ul className="space-y-1 pt-2 text-sm">
              {contact?.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-sm transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                  >
                    {contact.email}
                  </a>
                </li>
              )}

              {contact?.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="rounded-sm transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}

              {contact?.address?.streetAddress && (
                <li className="text-token-text/60">
                  {contact.address.streetAddress}
                  {contact.address.postalCode && `, ${contact.address.postalCode}`}
                  {contact.address.addressLocality && ` ${contact.address.addressLocality}`}
                  {contact.address.addressCountry && ` · ${contact.address.addressCountry}`}
                </li>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-7 sm:grid-cols-3">
            {navGroups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-token-text/60">
                  {group.title}
                </h3>

                <ul className="space-y-2">
                  {group.links.map(({ href, label, external }) => {
                    const finalHref = localizePath(href, locale)
                    const active =
                      href === '/'
                        ? pathname === finalHref || pathname === '/'
                        : pathname === finalHref || pathname.startsWith(`${finalHref}/`)

                    const isCookie = label.toLowerCase().includes('cookie')

                    const content = (
                      <>
                        {group.title.toLowerCase().includes('légal') ? <LegalIcon label={label} /> : null}
                        <span>{label}</span>
                      </>
                    )

                    return (
                      <li key={`${group.title}-${href}-${label}`}>
                        {external ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-sm text-token-text/80 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                            onClick={(e) => onNavClick(group.title, label, href, e)}
                            data-gtm="footer_link_external"
                          >
                            {content}
                          </a>
                        ) : isCookie ? (
                          <a
                            href="#cookies"
                            role="button"
                            aria-controls="tp-consent-panel"
                            className="inline-flex items-center gap-2 rounded-sm text-token-text/80 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                            onClick={(e) => onNavClick(group.title, label, '#cookies', e)}
                            data-gtm="footer_link_cookies"
                          >
                            {content}
                          </a>
                        ) : (
                          <Link
                            href={href}
                            prefetch={false}
                            aria-current={active ? 'page' : undefined}
                            className="inline-flex items-center gap-2 rounded-sm text-token-text/80 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                            onClick={(e) => onNavClick(group.title, label, href, e)}
                            data-gtm="footer_link_internal"
                          >
                            {content}
                          </Link>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </nav>
            ))}

            {!compact && (
              <div className="col-span-2 space-y-5 sm:col-span-1">
                <form
                  onSubmit={onSubscribe}
                  noValidate
                  className="space-y-3"
                  aria-label="Inscription newsletter"
                  aria-busy={status === 'loading'}
                  aria-describedby={message ? msgId : undefined}
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-token-text/60">
                    Newsletter
                  </h3>

                  <div className="flex gap-2">
                    <input
                      id={emailId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full rounded-md border border-token-border bg-token-surface/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
                      aria-required="true"
                      aria-invalid={status === 'error' && !isValidEmail(email) ? 'true' : 'false'}
                      autoComplete="email"
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="rounded-md bg-[hsl(var(--accent))] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[hsl(var(--accent)/.92)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.40)] disabled:opacity-60"
                      aria-label="S’inscrire à la newsletter"
                      data-gtm="footer_newsletter_submit"
                    >
                      {status === 'loading' ? 'Envoi…' : 'S’inscrire'}
                    </button>
                  </div>

                  <label htmlFor={consentId} className="flex items-start gap-2 text-[12px] text-token-text/70">
                    <input
                      id={consentId}
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      J’accepte de recevoir vos emails et la{' '}
                      <Link
                        href="/confidentialite"
                        prefetch={false}
                        className="underline hover:text-[hsl(var(--accent))]"
                      >
                        politique de confidentialité
                      </Link>
                      .
                    </span>
                  </label>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Votre site web</label>
                    <input
                      id="website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {message && (
                    <p
                      id={msgId}
                      className={status === 'error' ? 'text-xs text-red-600' : 'text-xs text-emerald-600'}
                      role="status"
                      aria-live="polite"
                    >
                      {message}
                    </p>
                  )}
                </form>

                <div className="flex items-center gap-6 text-xl text-token-text/60">
                  <a
                    href="https://facebook.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="rounded-sm transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    onClick={() => onSocialClick('facebook')}
                    data-gtm="footer_social_facebook"
                  >
                    <FaFacebookF />
                  </a>

                  <a
                    href="https://twitter.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="rounded-sm transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    onClick={() => onSocialClick('twitter')}
                    data-gtm="footer_social_twitter"
                  >
                    <FaTwitter />
                  </a>

                  <a
                    href="https://instagram.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="rounded-sm transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    onClick={() => onSocialClick('instagram')}
                    data-gtm="footer_social_instagram"
                  >
                    <FaInstagram />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {children && <div className="mt-10 text-center">{children}</div>}

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-token-border pt-5 text-sm md:flex-row">
          <p className="text-token-text/70">
            © {currentYear} <span className="font-semibold text-token-text">{companyName}</span>. Tous droits réservés.
          </p>

          <ul className="flex flex-wrap items-center gap-3 text-[12px] text-token-text/60">
            <li className="inline-flex items-center gap-1">
              <FaLock aria-hidden="true" /> Stripe · Visa · Mastercard · PayPal
            </li>
            <li className="hidden text-token-text/40 sm:inline">•</li>
            <li>FR • EUR</li>
            <li className="hidden text-token-text/40 sm:inline">•</li>
            <li>
              <a
                href="#cookies"
                role="button"
                aria-controls="tp-consent-panel"
                onClick={(e) => openConsentManager(e)}
                className="underline decoration-dotted underline-offset-2 hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
              >
                Préférences cookies
              </a>
            </li>
          </ul>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: 'Footer Navigation',
            url: origin,
            hasPart: navGroups.flatMap((group) =>
              group.links.map((link) =>
                link.external
                  ? { '@type': 'WebPage', name: link.label, url: link.href }
                  : {
                      '@type': 'WebPage',
                      name: link.label,
                      url: `${origin}${localizePath(link.href, locale)}`,
                    }
              )
            ),
          }),
        }}
      />
    </footer>
  )
}