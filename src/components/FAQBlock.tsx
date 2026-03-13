'use client';

import { useEffect, useState } from 'react';

interface FAQItem {
  q?: string;
  a?: string;
}

interface FAQBlockProps {
  productId: string;
}

export default function FAQBlock({ productId }: FAQBlockProps) {
  const [faq, setFaq] = useState<FAQItem[]>([]);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/faq/${productId}`)
      .then(res => res.json())
      .then((data: { faq?: FAQItem[] }) => setFaq(Array.isArray(data?.faq) ? data.faq : []));
  }, [productId]);

  if (!faq.length) return null;

  return (
    <section className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Questions fréquentes</h3>
      <ul>
        {faq.map((item, i) => (
          <li key={i} className="mb-2">
            <strong>{item.q}</strong>
            <div>{item.a}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
