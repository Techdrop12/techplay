import Link from 'next/link'

export default function EmptyCart() {
  return (
    <div className="text-center py-20">
      <h2 className="text-xl font-semibold mb-4">Votre panier est vide</h2>
      <Link href="/" className="text-blue-600 underline">
        Continuer vos achats
      </Link>
    </div>
  )
}
