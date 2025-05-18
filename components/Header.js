// components/Header.js
import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Header() {
  const { cart } = useCart()

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center">
      <Link href="/">
        <span className="text-xl font-bold">TechPlay</span>
      </Link>
      <nav className="space-x-4">
        <Link href="/">Accueil</Link>
        <Link href="/cart">
          Panier <span className="bg-white text-black px-2 rounded">{cart.length}</span>
        </Link>
      </nav>
    </header>
  )
}