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
  FaCcMastercard,
  FaCcPaypal,
  FaCcVisa,
  FaFacebookF,
  FaFileAlt,
  FaHeadset,
  FaInstagram,
  FaLock,
  FaShieldAlt,
  FaTruck,
  FaTwitter,
} from 'react-icons/fa'

import Link from '@/components/LocalizedLink'
import { BRAND } from '@/lib/constants'
import { getErrorMessageWithFallback } from '@/lib/errors'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

type NavGroup = {
  title: string
  links: FooterLink[]
}

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

const T = {
  fr: {
    ariaFooter: 'Pied de page',
    footerHeading: 'Informations et navigation secondaire',
    brandText:
      'Des accessoires et packs sélectionnés pour la performance, l’innovation et le style.',
    legalTitle: 'Légal',
    defaultGroups: [
      {
        title: 'Boutique',
        links: [
          { label: 'Accueil', href: '/' },
          { label: 'Catégories', href: '/categorie' },
          { label: 'Produits', href: '/products' },
          { label: 'Packs', href: '/products/packs' },
          { label: 'Wishlist', href: '/wishlist' },
        ],
      },
      {
        title: 'À propos',
        links: [
          { label: 'Qui sommes-nous', href: '/#about' },
          { label: 'Notre histoire', href: '/#about' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'FAQ', href: '/#faq' },
          { label: 'Suivi de commande', href: '/commande' },
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        title: 'Contact',
        links: [
          { label: 'Nous contacter', href: '/contact' },
        ],
      },
      {
        title: 'Retours',
        links: [
          { label: 'Retours & échanges', href: '/cgv' },
        ],
      },
      {
        title: 'Livraison',
        links: [
          { label: 'Infos livraison', href: '/cgv' },
        ],
      },
      {
        title: 'Confidentialité',
        links: [
          { label: 'Politique de confidentialité', href: '/confidentialite' },
          { label: 'Préférences cookies', href: '#cookies' },
        ],
      },
      {
        title: 'Mentions & CGV',
        links: [
          { label: 'Mentions légales', href: '/mentions-legales' },
          { label: 'Conditions générales', href: '/cgv' },
        ],
      },
    ] as NavGroup[],
    badges: {
      secure: 'Paiement sécurisé',
      shipping: 'Liv. 48–72h',
      support: 'Support 7j/7',
    },
    newsletterTitle: 'Newsletter',
    newsletterPlaceholder: 'votre@email.com',
    newsletterButtonIdle: 'S’inscrire',
    newsletterButtonLoading: 'Envoi…',
    newsletterFormAria: 'Inscription newsletter',
    newsletterSuccess: 'Inscription confirmée. Bienvenue chez TechPlay !',
    newsletterToastSuccess: 'Vous êtes inscrit(e) 🎉',
    newsletterToastError: 'Inscription impossible pour le moment',
    invalidEmail: 'Merci d’entrer une adresse email valide.',
    consentRequired: 'Vous devez accepter la politique de confidentialité.',
    genericError: 'Une erreur est survenue. Réessayez.',
    consentTextStart: 'J’accepte de recevoir vos emails et la ',
    privacyPolicy: 'politique de confidentialité',
    consentTextEnd: '.',
    hiddenWebsiteLabel: 'Votre site web',
    recentLocale: 'FR • EUR',
    rightsReserved: 'Tous droits réservés.',
    cookiePrefs: 'Préférences cookies',
    navigationSchemaName: 'Footer Navigation',
    social: {
      facebook: 'Facebook',
      twitter: 'Twitter / X',
      instagram: 'Instagram',
    },
  },
  en: {
    ariaFooter: 'Footer',
    footerHeading: 'Information and secondary navigation',
    brandText:
      'Accessories and bundles selected for performance, innovation and style.',
    legalTitle: 'Legal',
    defaultGroups: [
      {
        title: 'Shop',
        links: [
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/categorie' },
          { label: 'Products', href: '/products' },
          { label: 'Bundles', href: '/products/packs' },
          { label: 'Wishlist', href: '/wishlist' },
        ],
      },
      {
        title: 'About',
        links: [
          { label: 'About us', href: '/#about' },
          { label: 'Our story', href: '/#about' },
        ],
      },
      {
        title: 'Support',
        links: [
          { label: 'FAQ', href: '/#faq' },
          { label: 'Order tracking', href: '/commande' },
          { label: 'Blog', href: '/blog' },
        ],
      },
      {
        title: 'Contact',
        links: [
          { label: 'Contact us', href: '/contact' },
        ],
      },
      {
        title: 'Returns',
        links: [
          { label: 'Returns & refunds', href: '/cgv' },
        ],
      },
      {
        title: 'Shipping',
        links: [
          { label: 'Shipping info', href: '/cgv' },
        ],
      },
      {
        title: 'Privacy',
        links: [
          { label: 'Privacy policy', href: '/confidentialite' },
          { label: 'Cookie preferences', href: '#cookies' },
        ],
      },
      {
        title: 'Terms',
        links: [
          { label: 'Legal notice', href: '/mentions-legales' },
          { label: 'Terms & conditions', href: '/cgv' },
        ],
      },
    ] as NavGroup[],
    badges: {
      secure: 'Secure payment',
      shipping: '48–72h delivery',
      support: 'Support 7/7',
    },
    newsletterTitle: 'Newsletter',
    newsletterPlaceholder: 'your@email.com',
    newsletterButtonIdle: 'Subscribe',
    newsletterButtonLoading: 'Sending…',
    newsletterFormAria: 'Newsletter signup',
    newsletterSuccess: 'Subscription confirmed. Welcome to TechPlay!',
    newsletterToastSuccess: 'You are subscribed 🎉',
    newsletterToastError: 'Subscription is unavailable right now',
    invalidEmail: 'Please enter a valid email address.',
    consentRequired: 'You must accept the privacy policy.',
    genericError: 'Something went wrong. Please try again.',
    consentTextStart: 'I agree to receive emails and accept the ',
    privacyPolicy: 'privacy policy',
    consentTextEnd: '.',
    hiddenWebsiteLabel: 'Your website',
    recentLocale: 'EN • EUR',
    rightsReserved: 'All rights reserved.',
    cookiePrefs: 'Cookie preferences',
    navigationSchemaName: 'Footer Navigation',
    social: {
      facebook: 'Facebook',
      twitter: 'Twitter / X',
      instagram: 'Instagram',
    },
  },
} as const

function normalizeHref(href: string): string {
  if (!href || !href.startsWith('/')) return href

  return href
    .replace(/^\/produit(?!s)/, '/products')
    .replace(/^\/pack(?!s)/, '/products/packs')
    .replace(/^\/promo$/, '/products?promo=1')
    .replace(/^\/#?categories$/i, '/#categories')
    .replace(/^\/#?faq$/i, '/#faq')
}

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
  } catch {
    // no-op
  }
}


function LegalIcon({ label }: { label: string }) {
  const lower = label.toLowerCase()

  if (lower.includes('mention') || lower.includes('legal')) {
    return <FaFileAlt className="text-[hsl(var(--accent))]" aria-hidden="true" />
  }

  if (lower.includes('confidential') || lower.includes('privacy')) {
    return <FaLock className="text-[hsl(var(--accent))]" aria-hidden="true" />
  }

  if (lower.includes('cgv') || lower.includes('terms')) {
    return <FaFileAlt className="text-[hsl(var(--accent))]" aria-hidden="true" />
  }

  return null
}

export default function Footer({
  groups,
  links,
  companyName = 'TechPlay',
  compact = false,
  children,
  subscribeEndpoint = '/api/notifications/subscribe',
  siteUrl = BRAND.URL,
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
  const locale = getCurrentLocale(pathname) === 'en' ? 'en' : 'fr'
  const t = T[locale]
  const origin = String(siteUrl || '').replace(/\/$/, '')

  const baseGroups = useMemo<NavGroup[]>(() => {
    const source = groups ?? t.defaultGroups

    return source.map((group) => ({
      title: group.title,
      links: group.links.map((link) => ({
        ...link,
        href: normalizeHref(link.href),
      })),
    }))
  }, [groups, t.defaultGroups])

  const navGroups = useMemo<NavGroup[]>(() => {
    if (!links) return baseGroups

    const normalizedLegal = links.map((link) => ({
      ...link,
      href: normalizeHref(link.href),
    }))

    const clone = [...baseGroups]
    const index = clone.findIndex((group) => {
      const value = group.title.toLowerCase()
      return value.includes('légal') || value.includes('legal')
    })

    if (index >= 0) {
      clone[index] = {
        title: clone[index].title,
        links: normalizedLegal,
      }
    } else {
      clone.push({
        title: t.legalTitle,
        links: normalizedLegal,
      })
    }

    return clone
  }, [baseGroups, links, t.legalTitle])

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const emailId = useId()
  const messageId = useId()
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
    } catch {
      // no-op
    }

    try {
      window.dispatchEvent(new CustomEvent('open-consent-manager'))
    } catch {
      // no-op
    }

    pushDataLayer('open_consent_manager', { location: 'footer' })
  }

  const onSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (status === 'loading') return
    if (website) return

    if (!isValidEmail(email)) {
      setStatus('error')
      setMessage(t.invalidEmail)
      return
    }

    if (!consent) {
      setStatus('error')
      setMessage(t.consentRequired)
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
        throw new Error(maybe?.message || t.genericError)
      }

      pushDataLayer('newsletter_subscribe', {
        location: 'footer',
        locale,
        pathname,
      })

      setStatus('success')
      setMessage(t.newsletterSuccess)
      setEmail('')

      try {
        toast.success(t.newsletterToastSuccess)
      } catch {
        // no-op
      }
    } catch (error: unknown) {
      setStatus('error')
      setMessage(getErrorMessageWithFallback(error, t.genericError))

      try {
        toast.error(t.newsletterToastError)
      } catch {
        // no-op
      }
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

  const schemaLinks = navGroups.flatMap((group) =>
    group.links
      .filter((link) => !link.label.toLowerCase().includes('cookie'))
      .map((link) =>
        link.external
          ? {
              '@type': 'WebPage',
              name: link.label,
              url: link.href,
            }
          : {
              '@type': 'WebPage',
              name: link.label,
              url: `${origin}${localizePath(link.href, locale)}`,
            }
      )
  )

  return (
    <footer
      className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[hsl(var(--surface))] to-[hsl(var(--surface))]/95 text-token-text"
      role="contentinfo"
      aria-label={t.ariaFooter}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1400px_700px_at_85%_-15%,rgba(20,184,166,0.06),transparent_50%),radial-gradient(900px_450px_at_5%_110%,rgba(16,185,129,0.05),transparent_45%)]"
      />
      <div className="absolute inset-0 backdrop-blur-[1px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-screen-xl px-6 pb-8 pt-14 sm:px-8">
        <h2 className="sr-only" id="footer-heading">
          {t.footerHeading}
        </h2>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="space-y-5 md:col-span-5">
            <p className="text-xl font-extrabold tracking-tight sm:text-2xl">
              <span className="text-token-text dark:text-white">{companyName}</span>
              <span className="text-[hsl(var(--accent))]">.</span>
            </p>

            <p className="max-w-sm text-sm leading-relaxed text-token-text/70">{t.brandText}</p>

            {!compact ? (
              <>
                <ul className="mt-4 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-3">
                  <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-token-text/90 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:bg-black/20">
                    <FaShieldAlt className="text-emerald-500 shrink-0" aria-hidden="true" />
                    <span className="text-[13px] font-medium">{t.badges.secure}</span>
                  </li>
                  <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-token-text/90 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:bg-black/20">
                    <FaTruck className="text-[hsl(var(--accent))] shrink-0" aria-hidden="true" />
                    <span className="text-[13px] font-medium">{t.badges.shipping}</span>
                  </li>
                  <li className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-token-text/90 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:bg-black/20">
                    <FaHeadset className="text-amber-400 shrink-0" aria-hidden="true" />
                    <span className="text-[13px] font-medium">{t.badges.support}</span>
                  </li>
                </ul>

                <div className="flex items-center gap-4 pt-2 text-2xl text-token-text/50">
                  <FaCcVisa aria-label="Visa" className="transition-opacity hover:opacity-80" />
                  <FaCcMastercard aria-label="Mastercard" className="transition-opacity hover:opacity-80" />
                  <FaCcPaypal aria-label="PayPal" className="transition-opacity hover:opacity-80" />
                </div>
              </>
            ) : null}

            <ul className="space-y-1.5 pt-2 text-[13px] text-token-text/80">
              {contact?.email ? (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-md transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                  >
                    {contact.email}
                  </a>
                </li>
              ) : null}

              {contact?.phone ? (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="rounded-md transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                  >
                    {contact.phone}
                  </a>
                </li>
              ) : null}

              {contact?.address?.streetAddress ? (
                <li className="text-token-text/60">
                  {contact.address.streetAddress}
                  {contact.address.postalCode ? `, ${contact.address.postalCode}` : ''}
                  {contact.address.addressLocality ? ` ${contact.address.addressLocality}` : ''}
                  {contact.address.addressCountry ? ` · ${contact.address.addressCountry}` : ''}
                </li>
              ) : null}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-6 md:col-span-7 sm:grid-cols-3 lg:grid-cols-4">
            {navGroups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-token-text/60">
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

                    const linkClass =
                      'inline-flex items-center gap-2 rounded-md py-0.5 text-[13px] text-token-text/80 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]'
                    const content = (
                      <>
                        {group.title.toLowerCase().includes('légal') ||
                        group.title.toLowerCase().includes('legal') ? (
                          <LegalIcon label={label} />
                        ) : null}
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
                            className={linkClass}
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
                            className={linkClass}
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
                            className={linkClass}
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

            {!compact ? (
              <div className="col-span-2 space-y-5 sm:col-span-3 lg:col-span-4 lg:mt-4 lg:border-t lg:border-[hsl(var(--border))] lg:pt-8">
                <form
                  onSubmit={onSubscribe}
                  noValidate
                  className="space-y-3 max-w-md"
                  aria-label={t.newsletterFormAria}
                  aria-busy={status === 'loading'}
                  aria-describedby={message ? messageId : undefined}
                >
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[hsl(var(--text))]">
                    {t.newsletterTitle}
                  </h3>

                  <div className="flex gap-2">
                    <input
                      id={emailId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.newsletterPlaceholder}
                      className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-[13px] text-token-text placeholder:text-token-text/50 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
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
                      className="shrink-0 rounded-xl bg-[hsl(var(--accent))] px-4 py-2.5 text-[13px] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(20,184,166,0.4)] transition hover:shadow-[0_14px_40px_rgba(20,184,166,0.5)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] focus-visible:ring-offset-2 disabled:opacity-60"
                      aria-label={t.newsletterButtonIdle}
                      data-gtm="footer_newsletter_submit"
                    >
                      {status === 'loading'
                        ? t.newsletterButtonLoading
                        : t.newsletterButtonIdle}
                    </button>
                  </div>

                  <label
                    htmlFor={consentId}
                    className="flex items-start gap-2 text-[12px] text-token-text/70"
                  >
                    <input
                      id={consentId}
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      {t.consentTextStart}
                      <Link
                        href="/confidentialite"
                        prefetch={false}
                        className="underline hover:text-[hsl(var(--accent))]"
                      >
                        {t.privacyPolicy}
                      </Link>
                      {t.consentTextEnd}
                    </span>
                  </label>

                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">{t.hiddenWebsiteLabel}</label>
                    <input
                      id="website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {message ? (
                    <p
                      id={messageId}
                      className={status === 'error' ? 'text-xs text-red-600' : 'text-xs text-emerald-600'}
                      role="status"
                      aria-live="polite"
                    >
                      {message}
                    </p>
                  ) : null}
                </form>

                <div className="flex items-center gap-5 text-xl text-token-text/50">
                  <a
                    href="https://facebook.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.social.facebook}
                    className="rounded-lg p-1.5 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    onClick={() => onSocialClick('facebook')}
                    data-gtm="footer_social_facebook"
                  >
                    <FaFacebookF />
                  </a>

                  <a
                    href="https://twitter.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.social.twitter}
                    className="rounded-lg p-1.5 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    onClick={() => onSocialClick('twitter')}
                    data-gtm="footer_social_twitter"
                  >
                    <FaTwitter />
                  </a>

                  <a
                    href="https://instagram.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.social.instagram}
                    className="rounded-lg p-1.5 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))]"
                    onClick={() => onSocialClick('instagram')}
                    data-gtm="footer_social_instagram"
                  >
                    <FaInstagram />
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {children ? <div className="mt-10 text-center">{children}</div> : null}

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] md:flex-row">
          <p className="text-token-text/60">
            © {currentYear}{' '}
            <span className="font-semibold text-token-text/90">{companyName}</span>. {t.rightsReserved}
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-3 text-[12px] text-token-text/55">
            <li className="inline-flex items-center gap-1.5">
              <FaLock className="opacity-70" aria-hidden="true" /> Stripe · Visa · Mastercard · PayPal
            </li>
            <li className="hidden text-token-text/40 sm:inline">·</li>
            <li>{t.recentLocale}</li>
            <li className="hidden text-token-text/40 sm:inline">·</li>
            <li>
              <a
                href="#cookies"
                role="button"
                aria-controls="tp-consent-panel"
                onClick={(e) => openConsentManager(e)}
                className="underline decoration-dotted underline-offset-2 hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2"
              >
                {t.cookiePrefs}
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
            name: t.navigationSchemaName,
            url: origin,
            hasPart: schemaLinks,
          }),
        }}
      />
    </footer>
  )
}