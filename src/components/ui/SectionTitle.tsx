'use client';

import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="text-xl font-semibold mb-4 text-[hsl(var(--text))] [letter-spacing:var(--heading-tracking)]">
      {children}
    </h2>
  );
}
