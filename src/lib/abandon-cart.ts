export async function sendAbandonCartReminder(email: string, cart: any[]) {
  await fetch('/api/brevo/abandon-panier', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, cart }),
  })
}
