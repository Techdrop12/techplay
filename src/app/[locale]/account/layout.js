// ✅ /src/app/[locale]/account/layout.js (layout espace compte, UX sécurisé)
import LayoutWithAnalytics from '../LayoutWithAnalytics';

export default function AccountLayout({ children, params }) {
  return (
    <LayoutWithAnalytics locale={params.locale}>
      <div className="max-w-4xl mx-auto py-8">
        {children}
      </div>
    </LayoutWithAnalytics>
  );
}
