// pages/cancel.js
import Head from 'next/head'
import Header from '@/components/Header'

export default function Cancel() {
  return (
    <>
      <Head>
        <title>Commande annulée – TechPlay</title>
      </Head>
      <Header />
      <main className="p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Commande annulée</h1>
        <p>Vous pouvez revenir au panier pour finaliser votre achat.</p>
      </main>
    </>
  )
}
