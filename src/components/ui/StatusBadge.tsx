type StatusBadgeStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

interface StatusBadgeProps {
  status: StatusBadgeStatus | string;
}

const labelMap: Record<StatusBadgeStatus, string> = {
  pending: 'En attente',
  paid: 'Payée',
  shipped: 'Expédiée',
  cancelled: 'Annulée',
};

const colorMap: Record<StatusBadgeStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const label = labelMap[status as StatusBadgeStatus] ?? status;
  const color = colorMap[status as StatusBadgeStatus] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded ${color}`}>
      {label}
    </span>
  );
}
