// ✅ src/app/[locale]/admin/id/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function AdminIdPage({ params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">ID : {id}</h1>
      <p>Page générique pour affichage dynamique (personnalisez selon vos besoins admin).</p>
    </div>
  );
}
