'use client';

import { useTranslations } from 'next-intl';

export default function PromoBar() {
  const t = useTranslations('promo_bar');
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center py-2 text-sm font-medium">
      🎁 {t('text')}
    </div>
  );
}
