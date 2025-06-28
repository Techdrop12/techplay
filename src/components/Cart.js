// ✅ /src/components/Cart.js (panier full, bonus UX, sticky, optimisé)
'use client';

import { useCart } from '@/context/cartContext';
import Link from 'next/link';

export default function Cart() {
  const { cart, total, removeFromCart, clearCart } = useCart();

  if (!cart.length)
    return <div className="text-center text-gray-500 my-8">Votre panier est vide.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Votre panier</h2>
      <ul className="divide-y">
        {cart.map((item) => (
          <li key={item._id} className="py-3 flex items-center gap-4">
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 object-cover rounded border"
            />
            <div className="flex-1">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-500">{item.price} € x {item.qty}</p>
            </div>
            <button
              className="text-red-600 font-bold"
              onClick={() => removeFromCart(item._id)}
              aria-label="Supprimer"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-between items-center mt-6">
        <span className="font-bold text-lg">Total : {total.toFixed(2)} €</span>
        <button
          className="text-gray-600 text-xs underline"
          onClick={clearCart}
        >
          Vider le panier
        </button>
      </div>
      <Link
        href="/fr/commande"
        className="block bg-blue-600 hover:bg-blue-700 text-white font-bold mt-6 py-3 px-6 rounded shadow text-center"
      >
        Passer la commande
      </Link>
    </div>
  );
}
