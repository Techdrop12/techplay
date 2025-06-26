// ✅ src/app/[locale]/admin/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AdminAnalyticsBlock from '@/components/AdminAnalyticsBlock';

export default async function AdminPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>
      <AdminAnalyticsBlock />
    </div>
  );
}
