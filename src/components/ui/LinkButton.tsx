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
      className={`inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition ${className}`}
    >
      {children}
    </Link>
  );
}
