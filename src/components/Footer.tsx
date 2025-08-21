// src/components/Footer.tsx
'use client'

import { useId, useMemo, useState } from 'react'
import Link from 'next/link'
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

type FooterLink = { label: string; href: string; external?: boolean }
type NavGroup = { title: string; links: FooterLink[] }

interface FooterProps {
  groups?: NavGroup[]
  links?: FooterLink[]            // surcharge colonne “Légal”
  companyName?: string
  compact?: boolean
  children?: React.ReactNode
  subscribeEndpoint?: string      // POST { email }
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

const DEFAULT_GROUPS: NavGroup[] = [
  {
    title: 'Boutique',
    links: [
      { label: 'Accueil', href: '/' },
      { label: 'Catégories', href: '/categorie/accessoires' },
      { label: 'Produits', href: '/produit' },
      { label: 'Packs', href: '/pack' },
      { label: 'Wishlist', href: '/wishlist' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Suivi de commande', href: '/commande' },
      { label: 'Blog', href: '/blog' },
      { label: 'Promo du jour', href: '/promo' },
    ],
  },
  { title: 'Légal', links: DEFAULT_LEGAL },
]

const isValidEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim())

// GA helper – tolérant
const track = (action: string, data: Record<string, any> = {}) => {
  try { gaEvent?.({ action, category: 'engagement', label: data.label ?? action, value: 1 }) } catch {}
  try { logEvent?.(action, data) } catch {}
}

function LegalIcon({ label }: { label: string }) {
  const lower = label.toLowerCase()
  if (lower.includes('mention')) return <FaFileAlt className="text-accent" aria-hidden="true" />
  if (lower.includes('confidential')) return <FaLock className="text-accent" aria-hidden="true" />
  if (lower.includes('cgv')) return <FaFileAlt className="text-accent" aria-hidden="true" />
  return null
}

export default function Footer({
  groups = DEFAULT_GROUPS,
  links,
  companyName = 'TechPlay',
  compact = false,
  children,
  subscribeEndpoint = '/api/notifications/subscribe',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techplay.fr',
  contact = {
    email: 'support@techplay.fr',
    phone: '+33 1 84 80 12 34',
    address: { streetAddress: '12 rue de la Boutique', postalCode: '75000', addressLocality: 'Paris', addressCountry: 'FR' },
  },
}: FooterProps) {
  // remplace la colonne "Légal" si props.links fourni
  const navGroups = useMemo<NavGroup[]>(() => {
    if (!links) return groups
    const clone = [...groups]
    const idx = clone.findIndex((g) => g.title.toLowerCase().includes('légal'))
    if (idx >= 0) clone[idx] = { title: clone[idx].title, links }
    else clone.push({ title: 'Légal', links })
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
      setStatus('error'); setMessage('Merci d’entrer une adresse email valide.'); return
    }
    if (!consent) {
      setStatus('error'); setMessage('Vous devez accepter la politique de confidentialité.'); return
    }

    setStatus('loading'); setMessage('')
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
      setStatus('success'); setMessage('Inscription confirmée. Bienvenue chez TechPlay !'); setEmail('')
      try { toast.success('Vous êtes inscrit(e) 🎉') } catch {}
    } catch (err: any) {
      setStatus('error'); setMessage(err?.message || 'Une erreur est survenue. Réessayez.')
      try { toast.error('Inscription impossible pour le moment') } catch {}
    }
  }

  const onSocialClick = (network: 'facebook' | 'twitter' | 'instagram') =>
    track('social_click', { network })

  return (
    <footer
      className="relative border-t border-token-border bg-token-surface text-token-text overflow-hidden"
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Col 1 — brand + garanties + contacts */}
          <div className="md:col-span-5 space-y-5">
            <p className="text-xl font-extrabold tracking-tight">
              <span className="text-brand dark:text-white">{companyName}</span>
              <span className="text-accent">.</span>
            </p>
            <p className="text-sm text-token-text/70 leading-relaxed">
              Des accessoires et packs sélectionnés pour la performance, l’innovation et le style.
            </p>

            {!compact && (
              <>
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaShieldAlt className="text-success" aria-hidden="true" /> Paiement sécurisé
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaTruck className="text-accent" aria-hidden="true" /> Liv. 48–72h
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-token-border bg-token-surface/80 px-3 py-2 backdrop-blur">
                    <FaHeadset className="text-warning" aria-hidden="true" /> Support 7j/7
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
            <ul className="text-sm space-y-1 pt-2">
              {contact?.email && (
                <li>
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact?.phone && (
                <li>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
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
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {navGroups.map((group) => (
              <nav key={group.title} aria-label={group.title} className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-token-text/60">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.links.map(({ href, label, external }) => (
                    <li key={`${group.title}-${href}`}>
                      {external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-token-text/80 hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                        >
                          <span>{label}</span>
                        </a>
                      ) : (
                        <Link
                          href={href}
                          prefetch={false}
                          className="inline-flex items-center gap-2 text-token-text/80 hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                        >
                          {group.title.toLowerCase().includes('légal') ? <LegalIcon label={label} /> : null}
                          <span>{label}</span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            {!compact && (
              <div className="col-span-2 sm:col-span-1 space-y-5">
                {/* Newsletter */}
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
                      className="w-full rounded-md border border-token-border bg-token-surface/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      aria-required="true"
                      aria-invalid={status === 'error' && !isValidEmail(email) ? 'true' : 'false'}
                      autoComplete="email"
                      inputMode="email"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:opacity-60"
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
                      <Link href="/confidentialite" className="underline hover:text-accent">
                        politique de confidentialité
                      </Link>.
                    </span>
                  </label>

                  {/* Honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Votre site web</label>
                    <input id="website" type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" />
                  </div>

                  {message && (
                    <p id={msgId} className={status === 'error' ? 'text-xs text-red-600' : 'text-xs text-green-600'} role="status" aria-live="polite">
                      {message}
                    </p>
                  )}
                </form>

                {/* Réseaux sociaux */}
                <div className="flex items-center gap-6 text-token-text/60 text-xl">
                  <a
                    href="https://facebook.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    onClick={() => onSocialClick('facebook')}
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="https://twitter.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    onClick={() => onSocialClick('twitter')}
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="https://instagram.com/techplay"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
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
        <div className="mt-10 border-t border-token-border pt-5 text-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-token-text/70">
            © {currentYear}{' '}
            <span className="font-semibold text-token-text">{companyName}</span>. Tous droits réservés.
          </p>

          <ul className="flex flex-wrap items-center gap-3 text-[12px] text-token-text/60">
            <li className="inline-flex items-center gap-1">
              <FaLock aria-hidden="true" /> Stripe · Visa · Mastercard · PayPal
            </li>
            <li className="hidden sm:inline text-token-text/40">•</li>
            <li>FR • EUR</li>
          </ul>
        </div>
      </div>

      {/* JSON-LD Organization enrichi */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: companyName,
            url: siteUrl,
            sameAs: [
              'https://facebook.com/techplay',
              'https://twitter.com/techplay',
              'https://instagram.com/techplay',
            ],
            contactPoint: [
              contact?.email
                ? { '@type': 'ContactPoint', email: contact.email, contactType: 'customer support', availableLanguage: ['fr', 'en'] }
                : undefined,
              contact?.phone
                ? { '@type': 'ContactPoint', telephone: contact.phone, contactType: 'customer support', availableLanguage: ['fr', 'en'] }
                : undefined,
            ].filter(Boolean),
            address:
              contact?.address && Object.values(contact.address).some(Boolean)
                ? {
                    '@type': 'PostalAddress',
                    streetAddress: contact.address.streetAddress,
                    postalCode: contact.address.postalCode,
                    addressLocality: contact.address.addressLocality,
                    addressCountry: contact.address.addressCountry,
                  }
                : undefined,
          }),
        }}
      />
    </footer>
  )
}
