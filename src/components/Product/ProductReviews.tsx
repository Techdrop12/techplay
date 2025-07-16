import RatingStars from '@/components/ui/RatingStars'

export default function ProductReviews({ reviews }: { reviews: any[] }) {
  return (
    <div className="mt-8">
      <h3 className="font-semibold text-lg mb-4">Avis clients</h3>
      {reviews.length === 0 && <p>Aucun avis pour ce produit.</p>}
      {reviews.map((review) => (
        <div key={review._id} className="mb-4 border-b pb-2">
          <RatingStars value={review.rating} />
          <p className="text-sm text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  )
}
