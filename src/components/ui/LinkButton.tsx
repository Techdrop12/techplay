'use client';

import type { ReactNode } from 'react';

import Link from '@/components/LocalizedLink';

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function LinkButton({ href, children, className = '' }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-block rounded-[var(--radius)] bg-[hsl(var(--accent))] px-4 py-2 text-[hsl(var(--accent-fg))] outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </Link>
  );
}
