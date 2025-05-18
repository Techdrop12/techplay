// pages/products/[slug].js
import Head from 'next/head'
import { useRouter } from 'next/router'
import Header from '@/components/Header'
import { useCart } from '@/context/CartContext'

const productList = {
  'cable-usb-c': {
    title: 'Câble USB-C',
    description: 'Câble de recharge rapide compatible USB-C 3.0.',
    price: 9.99
  },
  'souris-gaming': {
    title: 'Souris Gaming',
    description: 'Souris précise avec RGB personnalisable et 7 boutons.',
    price: 29.99
  },
  'support-telephone': {
    title: 'Support Téléphone',
    description: 'Support de téléphone ajustable compatible voiture/bureau.',
    price: 14.99
  },
  'clavier-rgb': {
    title: 'Clavier RGB',
    description: 'Clavier mécanique RGB avec switches réactifs.',
    price: 49.99
  }
}

export default function ProductDetail() {
  const router = useRouter()
  const { slug } = router.query
  const { addToCart } = useCart()

  const product = productList[slug]

  if (!product) return <p>Chargement...</p>

  return (
    <>
      <Head>
        <title>{product.title} - TechPlay</title>
      </Head>
      <Header />
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
        <p className="text-gray-700 mb-2">{product.description}</p>
        <p className="text-lg font-semibold mb-4">{product.price} €</p>
        <button
          onClick={() => addToCart({ ...product, slug, quantity: 1 })}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Ajouter au panier
        </button>
      </main>
    </>
  )
}
