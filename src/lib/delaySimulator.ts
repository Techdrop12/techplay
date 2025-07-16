export function simulateDeliveryDelay(zipCode: string): string {
  if (zipCode.startsWith('75')) return 'Livraison estimée : demain'
  if (zipCode.startsWith('13')) return 'Livraison estimée : 2 jours'
  return 'Livraison estimée : 3 à 5 jours'
}
