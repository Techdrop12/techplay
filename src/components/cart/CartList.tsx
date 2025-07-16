import CartItem from '@/components/cart/CartItem'

export default function CartList({ items }: { items: any[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem key={item._id} item={item} />
      ))}
    </div>
  )
}
