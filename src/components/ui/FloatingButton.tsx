'use client';
import { useRouter } from 'next/navigation';

export default function FloatingButton({ href = '/', label = '⬅ Retour' }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
    >
      {label}
    </button>
  );
}
