// ✅ /src/app/[locale]/admin/produit/ajouter/page.js (formulaire ajout produit)
import AddProductForm from '@/components/AddProductForm';

export default function AdminAddProduitPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Ajouter un produit</h1>
      <AddProductForm />
    </div>
  );
}
