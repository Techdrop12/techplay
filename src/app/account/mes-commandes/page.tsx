import OrderList from '@/components/account/OrderList'

export default function MyOrdersPage() {
  // À connecter à session utilisateur
  const mockOrders = [
    { id: '12345' },
    { id: '67890' },
  ]

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Mes commandes</h1>
      <OrderList orders={mockOrders} />
    </main>
  )
}
