// ✅ src/app/[locale]/admin/commandes/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import OrdersTable from '@/components/OrdersTable';

export default async function AdminCommandesPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Commandes clients</h1>
      <OrdersTable />
    </div>
  );
}
