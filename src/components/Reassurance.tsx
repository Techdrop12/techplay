'use client';

import { Truck, Lock, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

const iconClass = 'mx-auto mb-1.5 h-6 w-6 text-[hsl(var(--accent))]';

export default function Reassurance() {
  const t = useTranslations('reassurance');
  return (
    <div className="mt-16 grid grid-cols-1 gap-6 text-sm text-muted-foreground sm:grid-cols-3">
      <div className="text-center">
        <Truck aria-hidden className={iconClass} size={24} />
        <p>{t('shipping_50')}</p>
      </div>
      <div className="text-center">
        <Lock aria-hidden className={iconClass} size={24} />
        <p>{t('payment_100')}</p>
      </div>
      <div className="text-center">
        <Package aria-hidden className={iconClass} size={24} />
        <p>{t('returns_30')}</p>
      </div>
    </div>
  );
}
