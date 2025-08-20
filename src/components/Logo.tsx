'use client'

interface LogoProps {
  /** Classes appliquées au wrapper. Contrôle la hauteur: ex. "h-8 md:h-10". */
  className?: string
  /** Afficher le texte “TechPlay” à côté du pictogramme */
  withText?: boolean
  /** Classes pour le texte (si withText=true) */
  textClassName?: string
  /** Libellé ARIA du composant (par défaut: “TechPlay”) */
  ariaLabel?: string
}

/**
 * Logo responsive et accessible.
 * - Utilise <picture> pour servir automatiquement la variante dark.
 * - La hauteur se contrôle au niveau du wrapper (l’icône suit avec h-full).
 */
export default function Logo({
  className = 'h-10 md:h-12',
  withText = true,
  textClassName = 'text-xl sm:text-2xl font-bold tracking-tight text-brand dark:text-brand-light',
  ariaLabel = 'TechPlay',
}: LogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      {/* SVG → <picture> pour thème auto ; PNG fallback si vieux UA */}
      <picture className="block h-full">
        <source srcSet="/logo-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
        <source srcSet="/logo.svg" type="image/svg+xml" media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)" />
        {/* Fallback PNG si SVG non supporté */}
        <img
          src="/logo.png"
          width={48}
          height={48}
          alt={withText ? '' : 'TechPlay'}
          aria-hidden={withText ? true : undefined}
          className="h-full w-auto select-none"
          draggable={false}
        />
      </picture>

      {withText && (
        <span className={textClassName}>TechPlay</span>
      )}
    </div>
  )
}
