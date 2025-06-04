// src/app/page.js
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirige la racine vers la locale par défaut (/fr)
  redirect('/fr');
}
