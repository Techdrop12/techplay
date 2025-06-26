// ✅ src/app/[locale]/layout.js

import LayoutWithAnalytics from './LayoutWithAnalytics';

export default function LocaleLayout({ children, params }) {
  const { locale } = params;
  return (
    <html lang={locale}>
      <body>
        <LayoutWithAnalytics locale={locale}>
          {children}
        </LayoutWithAnalytics>
      </body>
    </html>
  );
}
