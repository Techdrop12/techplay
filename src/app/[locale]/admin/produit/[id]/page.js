'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import EditProductForm from '@/components/EditProductForm';

export default function EditProductPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') return <p>Chargement...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Modifier le produit</h1>
      <EditProductForm productId={id} />
    </div>
  );
}
