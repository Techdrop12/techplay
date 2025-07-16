'use client'
import { useCart } from '@/lib/hooks/useCart'
import CartList from '@/components/cart/CartList'
import CartSummary from '@/components/cart/CartSummary'

export default function CheckoutPage() {
  const { cart } = useCart()

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold mb-6">Mon panier</h1>
        <CartList items={cart} />
      </div>
      <CartSummary items={cart} />
    </main>
  )
}
