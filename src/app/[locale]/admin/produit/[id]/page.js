// ✅ /src/app/[locale]/admin/produit/[id]/page.js (édition produit)
import EditProductForm from '@/components/EditProductForm';

export default function EditProduitPage({ params }) {
  const { id } = params;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Éditer le produit</h1>
      <EditProductForm productId={id} />
    </div>
  );
}
