import ProductGrid from "@/components/ProductGrid";
import SectionTitle from "@/components/SectionTitle";
import SectionWrapper from "@/components/SectionWrapper";

const dummyProducts = [
  { id: "1", name: "Câble iPhone Premium", image: "/products/cable.jpg", price: 8.99 },
  { id: "2", name: "Chargeur Rapide USB-C", image: "/products/charger.jpg", price: 14.99 },
  { id: "3", name: "Support Smartphone", image: "/products/support.jpg", price: 12.5 },
];

export default function ProductsPage() {
  return (
    <SectionWrapper>
      <SectionTitle title="Nos Produits" />
      <ProductGrid products={dummyProducts} />
    </SectionWrapper>
  );
}
