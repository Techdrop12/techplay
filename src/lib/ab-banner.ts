export function getBannerVariant() {
  const variants = ['Livraison offerte dès 50 €', '10 % offerts avec le code WELCOME10']
  const chosen = variants[Math.floor(Math.random() * variants.length)]
  return chosen
}
