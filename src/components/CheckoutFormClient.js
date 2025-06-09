// File: src/components/CheckoutFormClient.js
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutFormClient({ locale, t }) {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <Elements stripe={stripePromise}>
      <InnerForm locale={locale} t={t} />
    </Elements>
  );
}

function InnerForm({ locale, t }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cartItems, setCartItems] = useState([]);

  // Exemple : récupérer le panier depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    setCartItems(stored ? JSON.parse(stored) : []);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // 1) Créer côté serveur un PaymentIntent via votre API interne
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, locale }),
      });
      const { clientSecret } = await res.json();

      // 2) Confirmer le paiement avec Stripe.js
      const cardElement = elements.getElement(CardElement);
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        setErrorMessage(error.message || t('payment_error'));
        setIsLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Redirection vers la page de succès
        window.location.href = `/${locale}/success`;
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(t('payment_error'));
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t('your_cart')}</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">{t('cart_empty')}</p>
        ) : (
          <ul className="divide-y border rounded">
            {cartItems.map((item) => (
              <li key={item.id} className="p-4 flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {item.price.toFixed(2)} €
                  </p>
                </div>
                <p className="font-bold">
                  {(item.quantity * item.price).toFixed(2)} €
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 font-medium">{t('payment_details')}</label>
        <div className="border rounded p-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': { color: '#888' },
                },
                invalid: { color: '#e53e3e' },
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <p className="text-red-600 text-sm">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading || cartItems.length === 0}
        className={`w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded ${
          isLoading || cartItems.length === 0
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-blue-700'
        }`}
      >
        {isLoading ? t('processing') : t('pay_now')}
      </button>
    </form>
  );
}
