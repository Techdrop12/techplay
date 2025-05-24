'use client'

import { useEffect, useState } from 'react'
import SEOHead from '@/components/SEOHead'
import { useSession, signIn } from 'next-auth/react'

export default function MesCommandes() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') signIn()
  }, [status])

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/my-orders')
        .then(res => {
          if (!res.ok) throw new Error('Non autorisé')
          return res.json()
        })
        .then(data => setOrders(data || []))
        .catch(err => setError(err.message))
    }
  }, [session])

  const downloadInvoice = (order) => {
    fetch('/api/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `facture-${order._id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      })
      .catch(() => alert("Erreur lors de la génération de la facture"))
  }

  if (status === 'loading') return <p>Chargement...</p>

  return (
    <>
      <SEOHead overrideTitle="Mes commandes" overrideDescription="Historique de vos commandes TechPlay" />

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">📦 Mes commandes</h1>

        {error ? (
          <p className="text-red-600">Erreur : {error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">Aucune commande trouvée.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map(order => (
              <li key={order._id} className="border p-4 rounded bg-white dark:bg-zinc-800">
                <p><strong>Date :</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total :</strong> {order.total} €</p>
                <p><strong>Articles :</strong> {order.items.map(i => `${i.title} x${i.quantity}`).join(', ')}</p>
                <button
                  onClick={() => downloadInvoice(order)}
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Télécharger la facture PDF
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
