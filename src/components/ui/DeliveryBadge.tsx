export default function DeliveryBadge({ free = false }) {
  return (
    <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded w-fit">
      {free ? '🚚 Livraison gratuite' : 'Livraison rapide'}
    </div>
  );
}
