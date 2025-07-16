export default function DeliveryEstimate({ days = 7 }) {
  const today = new Date();
  const deliveryDate = new Date(today.setDate(today.getDate() + days));
  return (
    <p className="text-sm text-gray-600">
      🚚 Livraison estimée : <strong>{deliveryDate.toLocaleDateString()}</strong>
    </p>
  );
}
