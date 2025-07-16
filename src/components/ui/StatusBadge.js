export default function StatusBadge({ status }) {
  const map = {
    pending: 'En attente',
    paid: 'Payée',
    shipped: 'Expédiée',
    cancelled: 'Annulée',
  };

  const color = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    shipped: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded ${color[status] || 'bg-gray-100 text-gray-800'}`}>
      {map[status] || status}
    </span>
  );
}
