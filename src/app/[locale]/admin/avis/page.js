// ✅ src/app/[locale]/admin/avis/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AdminReviewTable from '@/components/AdminReviewTable';

export default async function AdminAvisPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestion des avis clients</h1>
      <AdminReviewTable />
    </div>
  );
}
