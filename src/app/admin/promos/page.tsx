import type { Metadata } from 'next';
import AdminPromosManager from '@/components/AdminPromosManager';

export const metadata: Metadata = {
  title: 'Codes promo – Admin TechPlay',
  robots: { index: false, follow: false },
};

export default function AdminPromosPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-page">Codes promo</h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Créez et gérez vos codes de réduction.
        </p>
      </header>
      <AdminPromosManager />
    </div>
  );
}
