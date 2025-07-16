"use client";
import useCart from "@/hooks/useCart";

export default function AddToCartButton({ product }: { product: any }) {
  const { add } = useCart();

  return (
    <button
      onClick={() => add(product)}
      className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-900"
    >
      Ajouter au panier
    </button>
  );
}
