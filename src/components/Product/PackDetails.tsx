import { formatPrice } from '@/lib/utils'

export default function PackDetails({ pack }: { pack: any }) {
  return (
    <div className="border rounded-lg p-6 shadow">
      <h1 className="text-2xl font-bold mb-4">{pack.name}</h1>
      <p className="text-brand text-xl font-semibold mb-4">{formatPrice(pack.price)}</p>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{pack.description}</p>
    </div>
  )
}
