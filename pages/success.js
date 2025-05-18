// pages/success.js
import Head from 'next/head'
import Header from '@/components/Header'

export default function Success() {
  return (
    <>
      <Head>
        <title>Commande réussie – TechPlay</title>
      </Head>
      <Header />
      <main className="p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Merci pour votre commande !</h1>
        <p>Un e-mail de confirmation vous a été envoyé. À bientôt sur TechPlay !</p>
      </main>
    </>
  )
}
