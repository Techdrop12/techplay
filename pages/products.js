import Head from 'next/head'

export default function Products() {
  const produits = [
    { id: 1, nom: 'Clavier RGB', prix: '34,90€' },
    { id: 2, nom: 'Casque Gaming', prix: '59,99€' },
    { id: 3, nom: 'Chargeur Rapide', prix: '12,90€' }
  ]

  return (
    <>
      <Head>
        <title>Produits - TechPlay</title>
      </Head>
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">Nos produits</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {produits.map((produit) => (
            <div key={produit.id} className="bg-white p-4 shadow rounded">
              <h2 className="font-semibold">{produit.nom}</h2>
              <p>{produit.prix}</p>
              <button className="mt-2 px-3 py-1 bg-black text-white rounded">Ajouter</button>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
