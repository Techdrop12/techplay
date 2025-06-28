// ✅ /src/app/[locale]/layout.js (i18n, PWA, UX, analytics, SEO)
import LayoutWithAnalytics from './LayoutWithAnalytics';

export const metadata = {
  title: {
    default: 'TechPlay – High Tech, Gadgets et Accessoires',
    template: '%s | TechPlay'
  }
};

export default function LocaleLayout({ children, params }) {
  return (
    <LayoutWithAnalytics locale={params.locale}>
      {children}
    </LayoutWithAnalytics>
  );
}
