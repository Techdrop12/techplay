// ✅ /src/app/success/page.js (redirection/fallback)
import { redirect } from 'next/navigation';

export default function SuccessRedirect() {
  // Redirige selon la langue ou l’url par défaut
  redirect('/fr/success');
}
