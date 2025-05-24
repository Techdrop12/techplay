'use client'

export default function ReviewList({ reviews }) {
  if (!reviews?.length) return <p className="text-gray-500">Aucun avis pour ce produit.</p>

  return (
    <ul className="space-y-3 text-sm">
      {reviews.map((r, i) => (
        <li key={i} className="border rounded p-3 bg-white dark:bg-zinc-800">
          <p className="font-semibold">{r.name} – {r.rating} ⭐</p>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>
        </li>
      ))}
    </ul>
  )
}
