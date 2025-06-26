// ✅ src/app/[locale]/admin/blog/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AdminBlogTable from '@/components/AdminBlogTable';

export default async function AdminBlogPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestion du Blog</h1>
      <AdminBlogTable />
    </div>
  );
}
