'use client';

import type { ReactNode } from 'react';

interface BadgePillProps {
  children: ReactNode;
}

export default function BadgePill({ children }: BadgePillProps) {
  return (
    <span className="inline-block bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))] rounded-full px-3 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}
