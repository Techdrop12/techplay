import type { ReactNode } from 'react';

interface ResponsiveGridProps {
  children: ReactNode;
}

export default function ResponsiveGrid({ children }: ResponsiveGridProps) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{children}</div>;
}
