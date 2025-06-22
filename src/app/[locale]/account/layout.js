// ✅ src/app/[locale]/account/layout.js

import LayoutWithAnalytics from '../LayoutWithAnalytics';

export const metadata = {
  title: 'Mon compte – TechPlay',
  description: 'Gérez vos informations personnelles et vos commandes.',
};

export default function AccountLayout({ children }) {
  return (
    <LayoutWithAnalytics>
      <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        {children}
      </div>
    </LayoutWithAnalytics>
  );
}
