// src/components/Breadcrumbs.tsx
// Fil d'Ariane accessible + SEO (JSON-LD optionnel), TS strict, design propre.
import type { ReactNode, HTMLAttributes } from 'react'
import Link from 'next/link'
import useBreadcrumbSegments from '@/lib/useBreadcrumbSegments'

type Crumb = {
  href?: string
  label: string
}

type HomeCrumb = {
  href: string
  label: string
}

type BreadcrumbsProps = {
  /** Liste ordonnée du fil d’Ariane (le dernier est la page courante et n’est pas cliquable) */
  links: Crumb[]
  /** Crumb "Accueil" automatique (false pour désactiver). */
  home?: HomeCrumb | false
  /** Séparateur visuel entre les crumbs. */
  separator?: ReactNode
  /** Ajoute un script JSON-LD https://schema.org/BreadcrumbList */
  jsonLd?: boolean
  /** Base URL absolue (ex: https://techplay.fr) pour JSON-LD. Si omis, on laisse les URLs telles quelles. */
  baseUrl?: string
  /** Troncature douce des labels trop longs. */
  truncateLabels?: boolean
  /** Classes supplémentaires sur le <nav>. */
  className?: string
} & Omit<HTMLAttributes<HTMLElement>, 'children'>

function joinUrl(base: string | undefined, path?: string) {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  if (!base) return path
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

export default function Breadcrumbs({
  links,
  home = { href: '/', label: 'Accueil' },
  separator = <span aria-hidden="true">/</span>,
  jsonLd = true,
  baseUrl,
  truncateLabels = true,
  className = '',
  ...rest
}: BreadcrumbsProps) {
  if (!Array.isArray(links) || links.length === 0) return null

  const needsHome =
    home !== false &&
    !(
      links[0]?.href === '/' ||
      links[0]?.label.toLowerCase() ===
        (typeof home === 'object' ? home.label.toLowerCase() : 'accueil')
    )

  const fullCrumbs: Crumb[] =
    home !== false && needsHome ? [home as HomeCrumb, ...links] : links

  const lastIndex = fullCrumbs.length - 1

  const jsonLdData =
    jsonLd && fullCrumbs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: fullCrumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: joinUrl(baseUrl, c.href) } : {}),
          })),
        }
      : null

  return (
    <nav
      aria-label="Fil d’Ariane"
      className={`mb-4 text-sm text-muted-foreground ${className}`}
      {...rest}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {fullCrumbs.map((crumb, i) => {
          const isLast = i === lastIndex
          const label = crumb.label

          const labelEl = (
            <span
              className={truncateLabels ? 'max-w-[22ch] truncate align-baseline' : 'align-baseline'}
              title={label}
            >
              {label}
            </span>
          )

          return (
            <li key={`${i}-${label}`} className="inline-flex items-center">
              {isLast || !crumb.href ? (
                <span
                  className="font-medium text-foreground"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {labelEl}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:underline underline-offset-2 decoration-1 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring rounded-sm"
                >
                  {labelEl}
                </Link>
              )}

              {!isLast && (
                <span className="px-2 text-foreground/40" role="separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          )
        })}
      </ol>

      {jsonLdData && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      )}
    </nav>
  )
}

/* --------------------------- AutoBreadcrumbs --------------------------- */
/** Variante auto qui se base sur l’URL courante via le hook unifié. */
export function AutoBreadcrumbs(props: Omit<BreadcrumbsProps, 'links'>) {
  const links = useBreadcrumbSegments()
  // Home label fr/en
  const locale = links[0]?.href?.startsWith('/en') ? 'en' : 'fr'
  const home =
    props.home === false
      ? false
      : {
          href: locale === 'en' ? '/en' : '/fr',
          label: locale === 'en' ? 'Home' : 'Accueil',
        }

  return (
    <Breadcrumbs
      {...props}
      links={links}
      home={home as HomeCrumb}
      baseUrl={props.baseUrl ?? process.env.NEXT_PUBLIC_SITE_URL}
    />
  )
}
