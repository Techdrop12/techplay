import type { Metadata } from 'next';

import ImportProductsTable from '@/components/ImportProductsTable';

export const metadata: Metadata = {
  title: 'Import produits – Admin TechPlay',
  description: 'Importer des produits en masse depuis un fichier JSON.',
  robots: { index: false, follow: false },
};

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 id="admin-import-title" className="heading-page">
          Importer des produits
        </h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Importer des produits en masse depuis un fichier JSON.
        </p>
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-[var(--shadow-sm)]">
        <ImportProductsTable />
      </div>
    </div>
  );
}
