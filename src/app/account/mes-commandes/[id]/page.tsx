export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const orderId = params.id

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Commande #{orderId}</h1>
      <p>Détail de la commande à venir...</p>
    </main>
  )
}
