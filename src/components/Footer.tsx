'use client'

import Link from 'next/link'
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaLock,
  FaFileAlt,
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

  return (
    <footer
      className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 py-12 mt-16 transition-all duration-300 ease-in-out"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div
        className={`max-w-6xl mx-auto px-6 flex flex-col ${
          compact ? 'items-center text-center' : 'md:flex-row justify-between items-center'
        } gap-6 text-sm`}
      >
        <p className={compact ? '' : 'text-center md:text-left'}>
          © {currentYear}{' '}
          <span className="font-semibold text-black dark:text-white">{companyName}</span>. Tous droits
          réservés.
        </p>

        <nav
          className="flex gap-6 flex-wrap justify-center md:justify-end"
          aria-label="Liens légaux et utiles"
        >
          {links.map(({ href, label }) => {
            let Icon = null
            if (label.toLowerCase().includes('mention')) Icon = FaFileAlt
            else if (label.toLowerCase().includes('confidentialité')) Icon = FaLock
            else if (label.toLowerCase().includes('cgv')) Icon = FaEnvelope

            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 hover:underline hover:text-black dark:hover:text-white transition"
              >
                {Icon && <Icon className="text-accent" aria-hidden="true" />}
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8 border-t border-gray-300 dark:border-gray-700 pt-8 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <p className="text-center md:text-left font-semibold text-lg text-accent">
          TechPlay, votre boutique high-tech de confiance.
        </p>

        <div className="flex justify-center gap-6 text-gray-600 dark:text-gray-400">
          <a
            href="https://facebook.com/techplay"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-accent transition-colors"
          >
            <FaFacebookF size={22} />
          </a>
          <a
            href="https://twitter.com/techplay"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-accent transition-colors"
          >
            <FaTwitter size={22} />
          </a>
          <a
            href="https://instagram.com/techplay"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-accent transition-colors"
          >
            <FaInstagram size={22} />
          </a>
        </div>
      </div>

      {children && <div className="mt-10 text-center">{children}</div>}
    </footer>
  )
}
