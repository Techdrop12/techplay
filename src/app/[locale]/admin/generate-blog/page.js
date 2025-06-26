// ✅ src/app/[locale]/admin/generate-blog/page.js

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import GenerateBlogPost from '@/components/GenerateBlogPost';

export default async function GenerateBlogPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    redirect('/fr/admin/login');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Générer des articles IA</h1>
      <GenerateBlogPost />
    </div>
  );
}
