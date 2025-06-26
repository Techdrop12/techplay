// ✅ src/app/[locale]/admin/produit/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import ProductTable from '@/components/ProductTable';

export default async function AdminProduitPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>
      <ProductTable />
    </div>
  );
}
