'use client';

import type { ReactNode } from 'react';

interface SectionTitleProps {
  children: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="heading-subsection mb-4">
      {children}
    </h2>
  );
}
