// ✅ /src/app/[locale]/admin/blog/page.js (gestion blog IA, SEO)
import AdminBlogTable from '@/components/AdminBlogTable';

export default function AdminBlogPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion du blog IA</h1>
      <AdminBlogTable />
    </div>
  );
}
