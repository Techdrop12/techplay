'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <Link href="/" className="text-xl font-bold">TechPlay</Link>
      <div className="space-x-4">
        <Link href="/panier" className="hover:underline">Panier</Link>
        <Link href="/admin" className="hover:underline">Admin</Link>
      </div>
    </nav>
  )
}
