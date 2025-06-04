// src/app/page.js

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  // Cette ligne redirige **immédiatement** "/" → "/fr"
  redirect('/fr');
}
