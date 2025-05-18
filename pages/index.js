// pages/index.js
import Head from 'next/head'
import Header from '@/components/Header'
import ProductCard from '@/components/ProductCard'

const products = [
  { slug: 'cable-usb-c', title: 'Câble USB-C', price: '9,99€', image: '/products/cable-usb.jpg' },
  { slug: 'souris-gaming', title: 'Souris Gaming', price: '29,99€', image: '/products/souris.jpg' },
  { slug: 'support-telephone', title: 'Support Téléphone', price: '14,99€', image: '/products/support.jpg' },
  { slug: 'clavier-rgb', title: 'Clavier RGB', price: '49,99€', image: '/products/clavier.jpg' }
]

export default function HomePage() {
  return (
    <>
      <Head>
        <title>TechPlay - Accueil</title>
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl font-bold text-center mb-4">Bienvenue sur TechPlay</h1>
        <p className="text-center text-gray-600 mb-12">Boutique Tech & Gaming nouvelle génération</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </main>
    </>
  )
}
