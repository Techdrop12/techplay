import type { Metadata } from 'next';
import AdminAuditTable from '@/components/AdminAuditTable';

export const metadata: Metadata = {
  title: 'Journal d\'activité – Admin TechPlay',
  robots: { index: false, follow: false },
};

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-page">Journal d'activité</h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Toutes les actions effectuées dans l'administration.
        </p>
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <AdminAuditTable />
      </div>
    </div>
  );
}
