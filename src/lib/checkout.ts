export async function createCheckoutSession(data: any) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error('Échec création session Stripe')
  return await res.json()
}
