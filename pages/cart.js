// pages/cart.js
import Head from 'next/head'
import Header from '@/components/Header'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const { cart, removeFromCart } = useCart()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)

  return (
    <>
      <Head>
        <title>Panier – TechPlay</title>
      </Head>
      <Header />
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">Votre Panier</h1>
        {cart.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {cart.map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-white p-4 shadow rounded">
                  <span>{item.title} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  <button onClick={() => removeFromCart(item)} className="text-red-600 hover:underline">Supprimer</button>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-right text-xl font-bold">Total : {total} €</p>
          </>
        )}
      </main>
    </>
  )
}
