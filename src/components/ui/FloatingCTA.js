import Link from 'next/link';

export default function FloatingCTA({ href = '/fr/commande', label = 'Commander' }) {
  return (
    <Link
      href={href}
      className="fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50 hover:bg-green-700"
    >
      🛒 {label}
    </Link>
  );
}
