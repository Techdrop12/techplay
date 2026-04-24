import type { Metadata } from 'next';

import NewsletterSubscribersTable from '@/components/NewsletterSubscribersTable';
import AdminExportButton from '@/components/AdminExportButton';

export const metadata: Metadata = {
  title: 'Newsletter – Admin TechPlay',
  robots: { index: false, follow: false },
};

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="admin-newsletter-title" className="heading-page">
            Inscrits newsletter
          </h1>
          <p className="mt-1 text-[15px] text-token-text/70">
            Liste des emails inscrits via le formulaire du footer.
          </p>
        </div>
        <AdminExportButton type="subscribers" label="Exporter CSV" />
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <NewsletterSubscribersTable />
      </div>
    </div>
  );
}
