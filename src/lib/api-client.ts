export async function postReview(productId: string, rating: number, comment: string) {
  const res = await fetch('/api/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, rating, comment }),
  })

  return await res.json()
}
