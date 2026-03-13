'use client';

import type { ReactNode } from 'react';

interface BadgePillProps {
  children: ReactNode;
}

export default function BadgePill({ children }: BadgePillProps) {
  return (
    <span className="inline-block bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}
