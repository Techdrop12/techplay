import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Créer un compte — TechPlay',
  description: 'Rejoignez TechPlay et accédez à votre espace personnel, vos commandes et votre liste de souhaits.',
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
