import type { Metadata } from 'next';
import AdminNewsletterSender from '@/components/AdminNewsletterSender';

export const metadata: Metadata = {
  title: 'Envoyer newsletter – Admin TechPlay',
  robots: { index: false, follow: false },
};

export default function AdminNewsletterSendPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="heading-page">Envoyer une newsletter</h1>
        <p className="mt-1 text-[15px] text-token-text/70">
          Rédigez et envoyez un email à tous vos abonnés.
        </p>
      </header>
      <AdminNewsletterSender />
    </div>
  );
}
