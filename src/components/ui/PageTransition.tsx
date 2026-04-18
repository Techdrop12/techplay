'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * Variante « UI » : même comportement que {@link RouteViewShell} — pas de
 * `window` dans le rendu (hydratation sûre).
 */
interface PageTransitionProps {
  children?: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="tp-page-transition min-h-0 w-full">
      {children}
    </div>
  );
}
