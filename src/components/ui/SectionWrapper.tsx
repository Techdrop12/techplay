'use client';

import type { ReactNode } from 'react';

interface SectionWrapperProps {
  children?: ReactNode;
  className?: string;
}

export default function SectionWrapper({ children, className = '' }: SectionWrapperProps) {
  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}
