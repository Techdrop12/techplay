'use client';

import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
      {children}
    </h2>
  );
}
