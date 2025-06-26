// ✅ src/app/[locale]/admin/produit/[id]/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import EditProductForm from '@/components/EditProductForm';

export default async function AdminEditProductPage({ params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Modifier le produit</h1>
      <EditProductForm productId={id} />
    </div>
  );
}
