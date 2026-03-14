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
      className={`inline-block bg-[hsl(var(--accent))] hover:opacity-95 text-[hsl(var(--accent-fg))] py-2 px-4 rounded transition ${className}`}
    >
      {children}
    </Link>
  );
}
