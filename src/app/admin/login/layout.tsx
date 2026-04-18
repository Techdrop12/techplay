import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion administration – TechPlay',
  description: 'Accès sécurisé à l’interface d’administration TechPlay.',
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
