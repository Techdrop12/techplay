'use client';

import type { ReactNode } from 'react';

interface HighlightProps {
  children: ReactNode;
}

export default function Highlight({ children }: HighlightProps) {
  return (
    <span className="bg-yellow-200 text-yellow-900 px-1 rounded">
      {children}
    </span>
  );
}
