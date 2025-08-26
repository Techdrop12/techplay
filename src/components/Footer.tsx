// src/components/Footer.tsx — Ultra Premium FINAL (i18n, tokens, SEO, newsletter) — sans doublon JSON-LD
'use client'

import { useId, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
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
import { event as gaEvent, logEvent } from '@/lib/ga'
import { toast } from 'react-hot-toast'
import Link from '@/components/LocalizedLink'
import { getCurrentLocale, localizePath } from '@/lib/i18n-routing'

type FooterLink = { label: string; href: string; external?: boolean }
type NavGroup = { title: string; links: FooterLink[] }

interface FooterProps {
  groups?: NavGroup[]
  /** Remplace la colonne “Légal” si fourni */
  links?: FooterLink[]
  companyName?: string
  compact?: boolean
  children?: React.ReactNode
  /** Endpoint d’inscription : POST { email } */
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

const DEFAULT_LEGAL: FooterLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'CGV', href: '/cgv' },
]

// normalisation d’anciennes routes -> nouvelles routes canoniques
const normalizeHref = (href: string) => {
  if (!href.startsWith('/')) return href
  return href
    .replace(/^\/produit(?!s)/, '/products')
    .replace(/^\/pack(?!s)/, '/products/packs')
    .replace(/^\/promo$/, '/products?promo=1')
}

const DEFAULT_GROUPS: NavGroup[] = [
  {
    title: 'Boutique',
    links: [
      { label: 'Accueil', href: '/' },
      { label: 'Catégories', href: '/#categories' }, // évite 404
      { label: 'Produits', href: '/products' },
      { label: 'Packs', href: '/products/packs' },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/#faq' }, // ancre home
      { label: 'Suivi de commande', href: '/commande' },
      { label: 'Blog', href: '/blog' },
      { label: 'Promo du jour', href: '/products?promo=1' },
    ],
  },
  { title: 'Légal', links: DEFAULT_LEGAL },
]

const isValidEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim())

// GA helper – tolérant
const track = (action: string, data: Record<string, any> = {}) => {
  try {
    gaEvent?.({
      action,
      category: data.category ?? 'engagement',
      label: data.label ?? action,
      value: data.value ?? 1,
      params: data.params ?? undefined,
    })
  } catch {}
  try {
    ;(logEvent as any)?.(action, data)
  } catch {}
}

function LegalIcon({ label }: { label: string }) {
  const lower = label.toLowerCase()
  if (lower.includes('mention')) return <FaFileAlt className="text-[hsl(var(--accent))]" aria-hidden="true" />
  if (lower.includes('confidential')) return <FaLock className="text-[hsl(var(--accent))]" aria-hidden="true" />
  if (lower.includes('cgv')) return <FaFileAlt className="text-[hsl(var(--accent))]" aria-hidden="true" />
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
  const locale = getCurrentLocale(pathname)
  const origin = (siteUrl || '').replace(/\/$/, '')

  // Remplace la colonne "Légal" si props.links fourni + normalise hrefs
  const navGroups = useMemo<NavGroup[]>(() => {
    const normalizeGroup = (g: NavGroup): NavGroup => ({
      title: g.title,
      links: g.links.map((l) => ({ ...l, href: normalizeHref(l.href) })),
    })
    const base = groups.map(normalizeGroup)
    if (!links) return base
    const clone = [...base]
    const idx = clone.findIndex((g) => g.title.toLowerCase().includes('légal'))
    const normalizedLegal = links.map((l) => ({ ...l, href: normalizeHref(l.href) }))
    if (idx >= 0) clone[idx] = { title: clone[idx].title, links: normalizedLegal }
    else clone.push({ title: 'Légal', links: normalizedLegal })
    return clone
  }, [groups, links])

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const emailId = useId()
  const msgId = useId()
  const consentId = useId()

  // Newsletter state
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  // Honey-pot + consent
  const [website, setWebsite] = useState('')
  const [consent, setConsent] = useState(true)

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    if (website) return // bot
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
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const maybe = await res.json().catch(() => null)
        throw new Error(maybe?.message || 'Erreur API')
      }
      track('newsletter_subscribe', { location: 'footer' })
      setStatus('success')
      setMessage('Inscription confirmée. Bienvenue chez TechPlay !')
      setEmail('')
      try { toast.success('Vous êtes inscrit(e) 🎉') } catch {}
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || 'Une erreur est survenue. Réessayez.')
      try { toast.error('Inscription impossible pour le moment') } catch {}
    }
  }

  const onSocialClick = (network: 'facebook' | 'twitter' | 'instagram') =>
    track('social_click', { network, category: 'social', location: 'footer' })

  const onNavClick = (groupTitle: string, label: string, href: string) =>
    track('footer_nav_click', { group: groupTitle, label, href, from: pathname })

  return (
    <footer
      className="relative overflow-hidden border-t border-token-border bg-token-surface text-token-text"
      role="contentinfo"
      aria-label="Pied de page"
    >
      {/* Fond premium (dégradés + léger blur) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-20%,rgba(37,99,235,0.08),transparent),radial-gradient(800px_400px_at_10%_120%,rgba(16,185,129,0.06),transparent)]"
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-screen-xl px-6 pt-12 pb-6">
        <h2 className="sr-only" id="footer-heading">Informations et navigation secondaire</h2>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Col 1 — brand + garanties + contacts */}
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
                    <FaShieldAlt className="text-emerald-500" aria-hidden="true" /> Paiement sécurisé
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaTruck className="text-[hsl(var(--accent))]" aria-hidden="true" /> Liv. 48–72h
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaHeadset className="text-amber-400" aria-hidden="true" /> Support 7j/7
                  </li>
                </ul>

                {/* Paiements */}
                <div className="flex items-center gap-3 pt-1 text-2xl text-token-text/60">
                  <FaCcVisa aria-label="Visa" />
                  <FaCcMastercard aria-label="Mastercard" />
                  <FaCcPaypal aria-label="PayPal" />
                </div>
              </>
            )}

            {/* Coordonnées */}
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

          {/* Col 2/3/4 — Groupes + Newsletter */}
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
                        ? pathname === '/'
                        : pathname === finalHref || pathname.startsWith(finalHref + '/')

                    const item = (
                      <>
                        {group.title.toLowerCase().includes('légal') ? <LegalIcon label={label} /> : null}
                        <span>{label}</span>
                      </>
                    )

                    return (
                      <li key={`${group.title}-${href}`}>
                        {external ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-sm text-token-text/80 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                            onClick={() => onNavClick(group.title, label, href)}
                          >
                            {item}
                          </a>
                        ) : (
                          <Link
                            href={href}
                            prefetch={false}
                            aria-current={active ? 'page' : undefined}
                            className="inline-flex items-center gap-2 rounded-sm text-token-text/80 transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                            onClick={() => onNavClick(group.title, label, href)}
                          >
                            {item}
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
                {/* Newsletter */}
                <form
                  onSubmit={onSubscribe}
                  noValidate
                  className="space-y-3"
                  aria-label="Inscription newsletter"
                  aria-busy={status === 'loading'}
                  aria-describedby={message ? msgId : undefined}
                >
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-token-text/60">Newsletter</h3>
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
                      <Link href="/confidentialite" prefetch={false} className="underline hover:text-[hsl(var(--accent))]">
                        politique de confidentialité
                      </Link>
                      .
                    </span>
                  </label>

                  {/* Honeypot */}
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

                {/* Réseaux sociaux */}
                <div className="flex items-center gap-6 text-xl text-token-text/60">
                  <a
                    href="https://facebook.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="rounded-sm transition-colors hover:text-[hsl(var(--accent))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]"
                    onClick={() => onSocialClick('facebook')}
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
                  >
                    <FaInstagram />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Slot enfants éventuels */}
        {children && <div className="mt-10 text-center">{children}</div>}

        {/* Sous-footer */}
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
          </ul>
        </div>
      </div>

      {/* JSON-LD SiteNavigationElement (✅ pas d’Organization ici pour éviter le doublon avec le layout) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SiteNavigationElement',
            name: 'Footer Navigation',
            url: origin,
            hasPart: navGroups.flatMap((g) =>
              g.links.map((l) => (l.external
                ? { '@type': 'WebPage', name: l.label, url: l.href }
                : { '@type': 'WebPage', name: l.label, url: `${origin}${localizePath(l.href, locale)}` }
              ))
            ),
          }),
        }}
      />
    </footer>
  )
}
