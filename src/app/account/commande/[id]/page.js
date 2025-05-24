'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    fetch(`/api/user/orders/${id}`)
      .then(res => res.json())
      .then(setOrder)
  }, [id])

  if (!order) return <p className="p-4">Chargement de la commande...</p>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Commande #{order._id}</h1>
      <p><strong>Email :</strong> {order.email}</p>
      <p><strong>Date :</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Total :</strong> {order.total} €</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Articles</h2>
      <ul className="list-disc ml-6">
        {order.items.map((item, idx) => (
          <li key={idx}>{item.title} x{item.quantity}</li>
        ))}
      </ul>
    </div>
  )
}
