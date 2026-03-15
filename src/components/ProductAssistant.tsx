'use client';

import { motion } from 'framer-motion';
import { Bot, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProductAssistantProps {
  product?: {
    title?: string;
    description?: string;
    price?: number | string;
    category?: string;
  };
}

export default function ProductAssistant({ product }: ProductAssistantProps) {
  const t = useTranslations('misc');
  const tProduct = useTranslations('product');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: JSON.stringify({
            title: product?.title,
            description: product?.description,
            price: product?.price,
            category: product?.category,
          }),
        }),
      });

      const data = await res.json();
      if (!data?.reply) throw new Error();

      setResponse(data.reply);
    } catch {
      toast.error(t('product_assistant_error'));
      setResponse("Désolé, une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 p-4 border border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--surface))] shadow-[var(--shadow-sm)]">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-[hsl(var(--text))]">
        <Bot size={18} /> Besoin d'un conseil instantané ?
      </h3>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && askAI()}
          placeholder={t('chatbot_placeholder')}
          className="flex-1 border px-3 py-2 rounded text-sm"
          aria-label={tProduct('question_product_aria')}
        />
        <button
          onClick={askAI}
          className="bg-black text-white px-4 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Réponse...' : 'Demander'}
        </button>
      </div>

      {response && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm bg-white border rounded p-3 shadow-inner"
          role="status"
          aria-live="polite"
        >
          {response}
        </motion.div>
      )}
    </div>
  );
}
