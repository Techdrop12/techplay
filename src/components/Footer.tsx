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
      className="bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 pt-12 pb-6 px-6 select-none"
      role="contentinfo"
      aria-label="Pied de page"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Colonne 1 — description + copyright */}
        <div className="space-y-4 md:w-1/2">
          <p className="text-lg font-semibold text-accent">
            TechPlay, votre boutique high-tech de confiance.
          </p>
          <p className="text-sm text-muted-foreground">
            © {currentYear} <span className="font-semibold text-black dark:text-white">{companyName}</span>. Tous droits réservés.
          </p>
        </div>

        {/* Colonne 2 — liens légaux */}
        <nav
          className="flex flex-col gap-3 text-sm md:text-right md:w-1/4"
          aria-label="Liens utiles"
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
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-accent transition-colors"
              >
                {Icon && <Icon className="text-accent" aria-hidden="true" />}
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Colonne 3 — réseaux sociaux */}
        <div className="flex items-center justify-start md:justify-end gap-6 text-gray-500 dark:text-gray-400 text-xl">
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

      {/* Enfant ou bonus */}
      {children && <div className="mt-10 text-center">{children}</div>}
    </footer>
  )
}
