'use client';

import { useCart } from '@/context/cartContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Cart({ locale = 'fr' }) {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [total, setTotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const calc = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(calc.toFixed(2));
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(locale === 'fr' ? 'Votre panier est vide.' : 'Your cart is empty.');
      return;
    }
    router.push(`/${locale}/commande`);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        {locale === 'fr' ? 'Votre panier est vide.' : 'Your cart is empty.'}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto p-4 space-y-4"
    >
      <h1 className="text-2xl font-bold mb-4">
        {locale === 'fr' ? '🛒 Votre panier' : '🛒 Your Cart'}
      </h1>

      <ul className="divide-y">
        {cart.map((item) => (
          <li key={item._id} className="flex items-center py-4 gap-4">
            <Image
              src={item.image || '/placeholder.jpg'}
              alt={item.title}
              width={64}
              height={64}
              className="rounded shadow"
            />
            <div className="flex-1">
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-500">{item.price.toFixed(2)} € x {item.quantity}</p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="px-2 py-1 rounded border text-sm hover:bg-gray-100"
                  aria-label="Diminuer"
                >−</button>
                <span className="min-w-[24px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="px-2 py-1 rounded border text-sm hover:bg-gray-100"
                  aria-label="Augmenter"
                >+</button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} €</p>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-xs text-red-600 underline hover:no-underline mt-1"
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
        onClick={handleCheckout}
        className="w-full mt-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
      >
        {locale === 'fr' ? 'Valider et payer' : 'Checkout'}
      </button>
    </motion.div>
  );
}
