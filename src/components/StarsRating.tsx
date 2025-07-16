import { Star } from 'lucide-react'

export default function StarsRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={16} fill={i <= rating ? 'currentColor' : 'none'} />
      ))}
    </div>
  )
}
