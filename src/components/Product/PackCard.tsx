import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default function PackCard({ pack }: { pack: any }) {
  return (
    <Link href={`/pack/${pack.slug}`}>
      <div className="border rounded-xl p-4 shadow hover:shadow-md transition text-center">
        <h3 className="font-semibold text-lg mb-2">{pack.name}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{pack.description}</p>
        <p className="text-brand font-bold text-xl">{formatPrice(pack.price)}</p>
      </div>
    </Link>
  )
}
