import type { Metadata } from 'next';
import AdminClientsTable from '@/components/AdminClientsTable';

export const metadata: Metadata = {
  title: 'Clients – Admin TechPlay',
  robots: { index: false, follow: false },
};

export default function AdminClientsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-page">Clients</h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Historique d'achat par client, agrégé depuis les commandes.
        </p>
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <AdminClientsTable />
      </div>
    </div>
  );
}
