'use client';

import { useTranslations } from 'next-intl';

import Link from '@/components/LocalizedLink';

type Props = {
  className?: string;
  prefetch?: boolean;
  variant?: 'default' | 'outline';
  /** @deprecated use className for focus ring; kept for aria */
  'aria-label'?: string;
};

export default function BackToHomeLink({
  className = '',
  prefetch = false,
  variant = 'default',
  'aria-label': ariaLabel,
}: Props) {
  const t = useTranslations('common');
  const label = t('back_to_home');

  const baseClass =
    'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[15px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2';
  const classes =
    variant === 'outline'
      ? `border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface))]/80 ${baseClass} ${className}`
      : `bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] shadow-[var(--shadow-lg)] hover:opacity-95 focus-visible:ring-4 focus-visible:ring-[hsl(var(--accent)/.5)] ${baseClass} ${className}`;

  return (
    <Link href="/" className={classes} prefetch={prefetch} aria-label={ariaLabel ?? label}>
      ← {label}
    </Link>
  );
}
