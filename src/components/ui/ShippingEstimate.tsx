export default function ShippingEstimate({ days = 5 }) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const estimate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <p className="text-sm text-token-text/60 mt-1">
      📦 Livraison estimée : <strong>{estimate}</strong>
    </p>
  );
}
