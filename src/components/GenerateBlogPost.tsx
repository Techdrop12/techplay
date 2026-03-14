// ✅ src/components/GenerateBlogPost.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function GenerateBlogPost() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Merci de saisir un sujet');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        toast.error(message || 'Erreur lors de la génération');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data.post?.content ?? data.content ?? '');
      toast.success('Article généré avec succès !');
    } catch {
      toast.error('Erreur réseau');
    }
    setLoading(false);
  };

  return (
    <motion.div
      className="max-w-xl mx-auto p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-4">Générer un article de blog</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Sujet du blog"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border border-[hsl(var(--border))] rounded-lg p-2 w-full bg-[hsl(var(--surface))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))]"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[hsl(var(--accent))] hover:opacity-95 text-[hsl(var(--accent-fg))] px-4 py-2 rounded-lg w-full transition-all duration-200"
        >
          {loading ? 'Génération en cours...' : 'Générer'}
        </button>
      </form>

      {result && (
        <motion.div
          className="mt-6 p-4 bg-[hsl(var(--surface-2))] rounded-xl whitespace-pre-line border border-[hsl(var(--border))]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-semibold mb-2">Contenu généré :</h3>
          <p>{result}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
