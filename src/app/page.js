// src/app/page.js
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/fr');
}
