// ✅ /src/app/[locale]/admin/avis/page.js (gestion avis admin)
import AdminReviewTable from '@/components/AdminReviewTable';

export default function AdminAvisPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des avis clients</h1>
      <AdminReviewTable />
    </div>
  );
}
