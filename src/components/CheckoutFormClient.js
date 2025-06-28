'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutFormClient({ locale, t }) {
  return (
    <Elements stripe={stripePromise}>
      <InnerCheckoutForm locale={locale} t={t} />
    </Elements>
  );
}

function InnerCheckoutForm({ locale, t }) {
  const stripe = useStripe();
  const elements = useElements();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    try {
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems, locale })
      });

      const { clientSecret } = await res.json();
      const card = elements.getElement(CardElement);

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });

      if (error) {
        setErrorMsg(error.message || t('payment_error'));
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        window.location.href = `/${locale}/success`;
      }
    } catch (err) {
      console.error('[Checkout Error]', err);
      setErrorMsg(t('payment_error'));
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold">{t('your_cart')}</h2>
        {cartItems.length === 0 ? (
          <p className="text-gray-500 mt-2">{t('cart_empty')}</p>
        ) : (
          <ul className="divide-y rounded border">
            {cartItems.map((item) => (
              <li key={item._id} className="flex justify-between p-4">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} × {item.price.toFixed(2)} €
                  </p>
                </div>
                <p className="font-semibold">
                  {(item.quantity * item.price).toFixed(2)} €
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="card-element" className="block mb-2 font-medium">
          {t('payment_details')}
        </label>
        <div className="p-3 rounded border">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#111',
                  '::placeholder': { color: '#888' }
                },
                invalid: { color: '#e53e3e' }
              }
            }}
          />
        </div>
      </div>

      {errorMsg && (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || cartItems.length === 0}
        className={`w-full py-3 px-4 text-white font-semibold rounded transition ${
          !stripe || loading || cartItems.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? t('processing') : t('pay_now')}
      </button>
    </form>
  );
}
