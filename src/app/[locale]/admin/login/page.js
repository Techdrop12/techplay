// ✅ src/app/[locale]/admin/login/page.js

import LoginForm from '@/components/LoginForm';
import SEOHead from '@/components/SEOHead';

export default function AdminLoginPage() {
  return (
    <>
      <SEOHead
        overrideTitle="Connexion admin"
        overrideDescription="Accédez à l’administration de TechPlay."
        noIndex
      />
      <div className="max-w-md mx-auto py-16">
        <h1 className="text-2xl font-bold mb-4">Connexion Admin</h1>
        <LoginForm />
      </div>
    </>
  );
}
