import type { Metadata } from 'next';

import ContactSubmissionsTable from '@/components/ContactSubmissionsTable';

export const metadata: Metadata = {
  title: 'Messages contact – Admin TechPlay',
  robots: { index: false, follow: false },
};

export default function AdminContactPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 id="admin-contact-title" className="heading-page">
          Messages contact
        </h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Messages reçus via le formulaire de contact.
        </p>
      </header>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
        <ContactSubmissionsTable />
      </div>
    </div>
  );
}
