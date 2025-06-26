// ✅ src/app/[locale]/admin/produit/ajouter/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AddProductForm from '@/components/AddProductForm';

export default async function AdminProductAddPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ajouter un produit</h1>
      <AddProductForm />
    </div>
  );
}
