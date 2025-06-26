// ✅ src/app/[locale]/admin/importer/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import ImportProductsForm from '@/components/ImportProductsForm';

export default async function AdminImporterPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Importer des produits</h1>
      <ImportProductsForm />
    </div>
  );
}
