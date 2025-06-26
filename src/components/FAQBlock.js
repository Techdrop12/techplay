// ✅ src/components/FAQBlock.js

import { useEffect, useState } from 'react';

export default function FAQBlock({ productId }) {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    fetch(`/api/faq/${productId}`)
      .then((res) => res.json())
      .then(setFaqs);
  }, [productId]);

  if (!faqs.length) return null;

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-2">FAQ Produit</h2>
      <ul>
        {faqs.map((f) => (
          <li key={f._id} className="mb-3">
            <details>
              <summary className="font-semibold">{f.question}</summary>
              <div className="pl-2">{f.answer}</div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
