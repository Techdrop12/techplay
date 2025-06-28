// ✅ /src/app/[locale]/admin/commandes/page.js (gestion commandes admin)
import OrderTable from '@/components/OrderTable';

export default function AdminCommandesPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des commandes</h1>
      <OrderTable />
    </div>
  );
}
