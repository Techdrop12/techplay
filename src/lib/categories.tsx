import React from 'react'
import { cn } from '@/lib/utils'

type IconProps = { className?: string }

/** Badge premium : fond dégradé subtil + anneau (duotone) */
const IconBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span
    className={cn(
      'inline-flex h-9 w-9 items-center justify-center rounded-xl',
      'bg-[radial-gradient(120%_120%_at_30%_20%,hsl(var(--accent)/.16),hsl(var(--accent)/.06)_45%,transparent_70%)]',
      'ring-1 ring-[hsl(var(--accent)/.22)] shadow-[inset_0_1px_0_rgba(255,255,255,.18)]',
      className
    )}
  >
    {children}
  </span>
)

/** Pack d’icônes duotone (sans lib externe) */
const glyph = (d: string) => (
  <>
    <path d={d} fill="currentColor" className="opacity-90" />
    <path d={d} fill="currentColor" className="opacity-25 blur-[1.2px]" />
  </>
)

export const HeadphonesIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a7 7 0 0 1 14 0h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z')}
    </svg>
  </IconBadge>
)

export const KeyboardIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M3 6h18a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm2 3h2v2H5V9Zm3 0h2v2H8V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9Zm3 0h2v2h-2V9ZM5 12h2v2H5v-2Zm3 0h2v2H8v-2Zm3 0h5v2h-5v-2Z')}
    </svg>
  </IconBadge>
)

export const MouseIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M12 2a6 6 0 0 1 6 6v8a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6Zm0 2a4 4 0 0 0-4 4v2h8V8a4 4 0 0 0-4-4Zm-.5 1h1v3h-1V5Z')}
    </svg>
  </IconBadge>
)

export const CameraIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M9 4h6l1.5 2H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3L9 4Zm3 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z')}
    </svg>
  </IconBadge>
)

export const BatteryIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M2 8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v1h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8Zm9 1-3 5h2v3l3-5h-2V9Z')}
    </svg>
  </IconBadge>
)

export const SpeakerIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm5 2a2 2 0 1 0 .001 3.999A2 2 0 0 0 12 6Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z')}
    </svg>
  </IconBadge>
)

export const DriveIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Zm3 1h10v3H7V8Zm0 5h6v4H7v-4Z')}
    </svg>
  </IconBadge>
)

export const MonitorIcon: React.FC<IconProps> = ({ className }) => (
  <IconBadge className={className}>
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {glyph('M3 5h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7v2h3v2H7v-2h3v-2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z')}
    </svg>
  </IconBadge>
)

export type CategoryDef = {
  slug: string
  label: string
  desc: string
  href: string
  Icon: React.FC<IconProps>
}

/** Mapping centralisé (réutilisable partout) */
export const CATEGORIES: Readonly<CategoryDef[]> = [
  { slug: 'casques',   label: 'Casques',   desc: 'Audio immersif',       href: '/products?cat=casques',   Icon: HeadphonesIcon },
  { slug: 'claviers',  label: 'Claviers',  desc: 'Mécas & low-profile',  href: '/products?cat=claviers',  Icon: KeyboardIcon },
  { slug: 'souris',    label: 'Souris',    desc: 'Précision & confort',  href: '/products?cat=souris',    Icon: MouseIcon },
  { slug: 'webcams',   label: 'Webcams',   desc: 'Visio en HD',          href: '/products?cat=webcams',   Icon: CameraIcon },
  { slug: 'batteries', label: 'Batteries', desc: 'Power & hubs',         href: '/products?cat=batteries', Icon: BatteryIcon },
  { slug: 'audio',     label: 'Audio',     desc: 'Enceintes & DAC',      href: '/products?cat=audio',     Icon: SpeakerIcon },
  { slug: 'stockage',  label: 'Stockage',  desc: 'SSD & cartes',         href: '/products?cat=stockage',  Icon: DriveIcon },
  { slug: 'ecrans',    label: 'Écrans',    desc: '144Hz et +',           href: '/products?cat=ecrans',    Icon: MonitorIcon },
]
