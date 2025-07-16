import InvoiceButton from './InvoiceButton'

export default function OrderList({ orders }: { orders: any[] }) {
  return (
    <ul className="space-y-4">
      {orders.map((order) => (
        <li key={order.id} className="border rounded p-4">
          <p className="font-bold">Commande #{order.id}</p>
          <InvoiceButton orderId={order.id} />
        </li>
      ))}
    </ul>
  )
}
