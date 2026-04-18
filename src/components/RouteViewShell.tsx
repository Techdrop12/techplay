'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface RouteViewShellProps {
  children: ReactNode;
}

/**
 * Enveloppe du contenu principal entre deux routes : **aucun** Framer Motion
 * (évite les mismatches d’hydratation). Animation = CSS `.tp-page-transition`.
 */
export default function RouteViewShell({ children }: RouteViewShellProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="tp-page-transition relative z-[1] min-h-0 w-full">
      {children}
    </div>
  );
}
