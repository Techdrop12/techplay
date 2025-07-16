export function formatPrice(price: number, locale = 'fr-FR', currency = 'EUR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(price)
}
