import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

export default function CartItem({ item }: { item: any }) {
  return (
    <div className="flex gap-4 items-center">
      <div className="relative w-20 h-20">
        <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm">{formatPrice(item.price)} x {item.quantity}</p>
      </div>
    </div>
  )
}
