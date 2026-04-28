'use client';

import { memo } from 'react';

import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  /** Optional small label above the title (e.g. "FAQ", "Packs") */
  kicker?: string;
  /** Main section title */
  title: string;
  /** Optional short description below the title */
  sub?: string;
  /** Center align (default true) */
  center?: boolean;
  /** Semantic level */
  as?: 'h1' | 'h2' | 'h3';
  /** Element id for aria-labelledby / anchor */
  id?: string;
  className?: string;
}

function SectionHeader({
  kicker,
  title,
  sub,
  center = true,
  as: Tag = 'h2',
  id,
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn(center && 'mx-auto max-w-3xl text-center', className)}>
      {kicker ? (
        <>
          <p className="heading-kicker">{kicker}</p>
          {center !== false && (
            <div className="mx-auto mt-1.5 h-0.5 w-8 rounded-full bg-[hsl(var(--accent))] opacity-60" aria-hidden="true" />
          )}
        </>
      ) : null}
      <Tag id={id} className={cn('heading-section', kicker ? 'mt-3' : '', sub ? 'mb-0' : '')}>
        {title}
      </Tag>
      {sub ? (
        <p className={cn('heading-section-sub mt-4 max-w-2xl', center && 'mx-auto')}>{sub}</p>
      ) : null}
    </header>
  );
}

export default memo(SectionHeader);
