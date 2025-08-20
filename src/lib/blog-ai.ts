// src/lib/blog-ai.ts
// ✅ Générateur d’article “offline” : slugify robuste, plan auto,
// lecture estimée, tags naïfs, front-matter prêt si tu veux persister.

export type GeneratedArticle = {
  slug: string;
  title: string;
  content: string;   // markdown
  excerpt: string;
  tags: string[];
  readingMinutes: number;
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function makeOutline(prompt: string): string[] {
  const base = [
    "Introduction",
    "Pourquoi c’est important",
    "Étapes clés / Méthodologie",
    "Erreurs fréquentes et bonnes pratiques",
    "Conclusion et prochains pas",
  ];
  // si la requête ressemble à un produit/guide, on garde ce plan
  return base;
}

function naiveTagsFromPrompt(prompt: string): string[] {
  const words = Array.from(new Set(prompt.toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿñæœ0-9]+/g))).filter(
    (w) => w.length > 3
  );
  return words.slice(0, 6);
}

export async function generateArticleFromPrompt(prompt: string): Promise<GeneratedArticle> {
  const title = prompt.trim().replace(/\s+/g, " ").slice(0, 120);
  const slug = slugify(title);

  const sections = makeOutline(prompt);
  const body = sections
    .map(
      (s) =>
        `## ${s}\n\n` +
        `Texte de remplissage pour **${s.toLowerCase()}** basé sur le thème « ${title} ». ` +
        `Adapte ce paragraphe avec des données réelles, exemples, chiffres et visuels si disponibles.\n`
    )
    .join("\n");

  const content =
    `# ${title}\n\n` +
    `> Résumé rapide : ${title}. Ce guide vous donne l’essentiel à connaître.\n\n` +
    body;

  const excerpt = `Résumé : ${title}.`;
  const wordCount = content.split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const tags = naiveTagsFromPrompt(prompt);

  return { slug, title, content, excerpt, tags, readingMinutes };
}
