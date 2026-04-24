import type { Metadata } from 'next';

import OrderTable from '@/components/OrderTable';
import AdminExportButton from '@/components/AdminExportButton';

export const metadata: Metadata = {
  title: 'Commandes – Admin TechPlay',
  description: 'Liste des commandes passées sur la boutique.',
  robots: { index: false, follow: false },
};

export default function AdminCommandesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="admin-commandes-title" className="heading-page">
            Commandes
          </h1>
          <p className="mt-1 text-[15px] text-token-text/70">
            Liste des commandes passées sur la boutique.
          </p>
        </div>
        <AdminExportButton type="orders" label="Exporter CSV" />
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <OrderTable />
      </div>
    </div>
  );
}
