'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaLock,
  FaFileAlt,
  FaCheckCircle,
} from 'react-icons/fa'

interface FooterLink {
  label: string
  href: string
}

interface FooterProps {
  links?: FooterLink[]
  companyName?: string
  compact?: boolean
  children?: React.ReactNode
}

export default function Footer({
  links = [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Confidentialité', href: '/confidentialite' },
    { label: 'CGV', href: '/cgv' },
  ],
  companyName = 'TechPlay',
  compact = false,
  children,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  // Newsletter
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const onSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error')
      setMessage('Merci d’entrer une adresse email valide.')
      return
    }

    try {
      setStatus('loading')
      setMessage('')
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Erreur API')
      setStatus('success')
      setMessage('Inscription confirmée. Bienvenue chez TechPlay !')
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage("Une erreur est survenue. Réessaie dans un instant.")
    }
  }

  return (
    <footer
      className="bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 pt-12 pb-6 px-6"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Colonne 1 — description + copyright */}
        <div className="space-y-4">
          <p className="text-lg font-semibold text-accent">
            TechPlay, votre boutique high-tech de confiance.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Des accessoires et packs sélectionnés avec exigence pour la performance,
            l’innovation et le style.
          </p>
          <p className="text-sm">
            © {currentYear}{' '}
            <span className="font-semibold text-black dark:text-white">{companyName}</span>. Tous droits
            réservés.
          </p>

          {!compact && (
            <ul className="mt-4 space-y-2 text-sm" aria-label="Assurances et garanties">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-accent" aria-hidden="true" />
                Paiement 100% sécurisé (Stripe)
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-accent" aria-hidden="true" />
                Livraison rapide 48–72h
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-accent" aria-hidden="true" />
                Support client 7j/7
              </li>
            </ul>
          )}
        </div>

        {/* Colonne 2 — liens légaux */}
        <nav aria-label="Liens utiles" className="space-y-3 md:text-right">
          {links.map(({ href, label }) => {
            let Icon: React.ComponentType<{ className?: string }> | null = null
            const lower = label.toLowerCase()
            if (lower.includes('mention')) Icon = FaFileAlt
            else if (lower.includes('confidential')) Icon = FaLock
            else if (lower.includes('cgv')) Icon = FaEnvelope

            return (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
              >
                {Icon && <Icon className="text-accent" aria-hidden="true" />}
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Colonne 3 — Newsletter + réseaux */}
        <div className="space-y-5">
          {!compact && (
            <form onSubmit={onSubscribe} className="space-y-3" aria-label="Inscription newsletter">
              <label htmlFor="newsletter-email" className="text-sm font-semibold">
                Rejoignez la newsletter
              </label>
              <div className="flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  aria-required="true"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-md bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent/90 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 disabled:opacity-60"
                >
                  {status === 'loading' ? 'Envoi…' : 'S’inscrire'}
                </button>
              </div>
              {message && (
                <p
                  className={
                    status === 'error'
                      ? 'text-xs text-red-600'
                      : 'text-xs text-green-600'
                  }
                  role="status"
                >
                  {message}
                </p>
              )}
            </form>
          )}

          <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 text-xl">
            <a
              href="https://facebook.com/techplay"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-accent transition-colors"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com/techplay"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-accent transition-colors"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com/techplay"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-accent transition-colors"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Slot enfants éventuels */}
      {children && <div className="mt-10 text-center">{children}</div>}

      {/* JSON-LD Organization pour SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: companyName,
            url: 'https://www.techplay.fr',
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
