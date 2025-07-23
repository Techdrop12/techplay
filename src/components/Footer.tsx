'use client'

import Link from 'next/link'

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
      className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 py-8 mt-12 transition-all duration-300 ease-in-out"
      role="contentinfo"
    >
      <div
        className={`max-w-6xl mx-auto px-4 flex flex-col ${
          compact ? 'items-center text-center' : 'md:flex-row justify-between items-center'
        } gap-4 text-sm`}
      >
        <p className={compact ? '' : 'text-center md:text-left'}>
          © {currentYear}{' '}
          <span className="font-semibold text-black dark:text-white">{companyName}</span>. Tous droits réservés.
        </p>

        <nav className="flex gap-4 flex-wrap justify-center md:justify-end" aria-label="Liens utiles en bas de page">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:underline hover:text-black dark:hover:text-white transition"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {children && <div className="mt-6 text-center">{children}</div>}
    </footer>
  )
}
