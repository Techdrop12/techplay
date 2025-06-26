// ✅ src/components/Cart.js

'use client';

import { useCart } from '@/context/cartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Cart({ locale }) {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

  if (cart.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {locale === 'fr'
          ? 'Votre panier est vide.'
          : 'Your cart is empty.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul>
        {cart.map((item) => (
          <li key={item._id} className="flex items-center gap-4 border-b py-3">
            <Image
              src={item.image || '/placeholder.jpg'}
              alt={item.title}
              width={60}
              height={60}
              className="rounded"
            />
            <div className="flex-1">
              <div className="font-semibold">{item.title}</div>
              <div className="text-xs text-gray-500">{item.category}</div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  disabled={item.quantity <= 1}
                  aria-label="Diminuer"
                >-</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  aria-label="Augmenter"
                >+</button>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <span className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</span>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-red-600 text-xs underline hover:no-underline"
                aria-label="Supprimer"
              >
                {locale === 'fr' ? 'Supprimer' : 'Remove'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between font-bold text-lg border-t pt-4">
        <span>{locale === 'fr' ? 'Total' : 'Total'}</span>
        <span>{total} €</span>
      </div>
      <button
        onClick={() => router.push(`/${locale}/commande`)}
        className="w-full mt-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        {locale === 'fr' ? 'Commander' : 'Checkout'}
      </button>
    </div>
  );
}
