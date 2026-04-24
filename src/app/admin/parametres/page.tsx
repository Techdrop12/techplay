import type { Metadata } from 'next';
import AdminParametres from '@/components/AdminParametres';

export const metadata: Metadata = {
  title: 'Paramètres – Admin TechPlay',
  robots: { index: false, follow: false },
};

export default function AdminParametresPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-page">Paramètres</h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Configuration générale du site et du compte admin.
        </p>
      </header>
      <AdminParametres />
    </div>
  );
}
