'use client'

import { useTranslations } from 'next-intl'

export default function CheckoutSteps({ step = 1 }) {
  const t = useTranslations('checkout_steps')
  const steps = [t('cart'), t('details'), t('payment'), t('confirmation')]
  return (
    <div className="flex justify-between text-sm text-token-text/70 py-4">
      {steps.map((label, index) => (
        <div key={index} className="flex-1 text-center">
          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${step === index + 1 ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-fg))]' : 'bg-[hsl(var(--surface-2))]'}`}>
            {index + 1}
          </div>
          <p className="mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
