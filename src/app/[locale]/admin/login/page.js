// ✅ /src/app/[locale]/admin/login/page.js (login admin sécurisé)
import LoginForm from '@/components/LoginForm';

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Connexion administrateur</h1>
      <LoginForm />
    </div>
  );
}
