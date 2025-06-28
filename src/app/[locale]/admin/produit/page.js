// ✅ /src/app/[locale]/admin/produit/page.js (listing produits admin)
import ProductTable from '@/components/ProductTable';

export default function AdminProduitPage() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>
      <ProductTable />
    </div>
  );
}
