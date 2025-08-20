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
} from 'react-icons/fa'
import { event as gaEvent, logEvent } from '@/lib/ga'
import { toast } from 'react-hot-toast'

type FooterLink = { label: string; href: string }

interface FooterProps {
  links?: FooterLink[]
  companyName?: string
  /** Version compacte (sans newsletter / badges) */
  compact?: boolean
  /** Slot bas de footer (bandeau promo, etc.) */
  children?: React.ReactNode
  /** Endpoint d’inscription newsletter */
  subscribeEndpoint?: string
  /** URL canonique du site (pour JSON-LD) */
  siteUrl?: string
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'CGV', href: '/cgv' },
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
  links = DEFAULT_LINKS,
  companyName = 'TechPlay',
  compact = false,
  children,
  subscribeEndpoint = '/api/notifications/subscribe',
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techplay.fr',
}: FooterProps) {
  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const emailId = useId()
  const msgId = useId()

  // Newsletter state
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  // Honey-pot anti-bot
  const [website, setWebsite] = useState('')

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return

    // bot -> on fait rien
    if (website) return

    if (!isValidEmail(email)) {
      setStatus('error')
      setMessage('Merci d’entrer une adresse email valide.')
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
        // essaie de récupérer un message d’erreur backend
        const maybe = await res.json().catch(() => null)
        throw new Error(maybe?.message || 'Erreur API')
      }

      track('newsletter_subscribe', { location: 'footer' })
      setStatus('success')
      setMessage('Inscription confirmée. Bienvenue chez TechPlay !')
      setEmail('')
      // toast (si Toaster présent)
      try { toast.success('Vous êtes inscrit(e) 🎉') } catch {}
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || "Une erreur est survenue. Réessayez dans un instant.")
      try { toast.error('Inscription impossible pour le moment') } catch {}
    }
  }

  const onSocialClick = (network: 'facebook' | 'twitter' | 'instagram') => {
    track('social_click', { network })
  }

  return (
    <footer
      className="relative border-t border-gray-200/70 dark:border-gray-800/70 overflow-hidden"
      role="contentinfo"
      aria-label="Pied de page"
    >
      {/* Background subtil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-20%,rgba(37,99,235,0.08),transparent),radial-gradient(800px_400px_at_10%_120%,rgba(16,185,129,0.06),transparent)]"
      />
      <div className="absolute inset-0 backdrop-blur-[2px]" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-6 text-gray-700 dark:text-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Col 1 — brand + trust */}
          <div className="md:col-span-5 space-y-4">
            <p className="text-xl font-extrabold tracking-tight">
              <span className="text-brand dark:text-white">{companyName}</span>
              <span className="text-accent">.</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Des accessoires et packs sélectionnés pour la performance, l’innovation et le style.
            </p>

            {!compact && (
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <li className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800/70 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/50">
                  <FaShieldAlt className="text-green-600" aria-hidden="true" />
                  Paiement sécurisé
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800/70 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/50">
                  <FaTruck className="text-blue-600" aria-hidden="true" />
                  Liv. 48–72h
                </li>
                <li className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800/70 bg-white/60 dark:bg-zinc-900/60 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-white/50">
                  <FaHeadset className="text-purple-600" aria-hidden="true" />
                  Support 7j/7
                </li>
              </ul>
            )}
          </div>

          {/* Col 2 — Liens */}
          <nav className="md:col-span-3 space-y-2" aria-label="Liens utiles">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Légal
            </h3>
            <ul className="space-y-2">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                  >
                    <LegalIcon label={label} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3 — Newsletter + Social */}
          <div className="md:col-span-4 space-y-5">
            {!compact && (
              <form
                onSubmit={onSubscribe}
                noValidate
                className="space-y-3"
                aria-label="Inscription newsletter"
                aria-busy={status === 'loading'}
                aria-describedby={message ? msgId : undefined}
              >
                <label htmlFor={emailId} className="text-sm font-semibold">
                  Rejoignez la newsletter
                </label>
                <div className="flex gap-2">
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-zinc-900/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-required="true"
                    aria-invalid={status === 'error' && !isValidEmail(email) ? 'true' : 'false'}
                    autoComplete="email"
                    inputMode="email"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold shadow hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:opacity-60"
                  >
                    {status === 'loading' ? 'Envoi…' : 'S’inscrire'}
                  </button>
                </div>

                {/* Honeypot (invisible & ignoré par SR) */}
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
                    className={status === 'error' ? 'text-xs text-red-600' : 'text-xs text-green-600'}
                    role="status"
                    aria-live="polite"
                  >
                    {message}
                  </p>
                )}

                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  En vous inscrivant, vous acceptez de recevoir nos emails. Vous pouvez vous
                  désinscrire à tout moment.
                </p>
              </form>
            )}

            <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 text-xl">
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
                aria-label="Twitter"
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
        </div>

        {/* Slot enfants éventuels */}
        {children && <div className="mt-10 text-center">{children}</div>}

        {/* Sous-footer */}
        <div className="mt-10 border-t border-gray-200/70 dark:border-gray-800/70 pt-5 text-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 dark:text-gray-400">
            © {currentYear}{' '}
            <span className="font-semibold text-black dark:text-white">{companyName}</span>. Tous droits réservés.
          </p>

          <ul className="flex flex-wrap items-center gap-3 text-[12px] text-gray-500">
            <li className="inline-flex items-center gap-1">
              <FaLock aria-hidden="true" /> Stripe · Visa · Mastercard · PayPal
            </li>
            <li className="hidden sm:inline text-gray-400">•</li>
            <li>FR • EUR</li>
          </ul>
        </div>
      </div>

      {/* JSON-LD Organization */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
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
          }),
        }}
      />
    </footer>
  )
}
