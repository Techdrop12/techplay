export async function generateArticleFromPrompt(prompt: string): Promise<{ slug: string; title: string; content: string }> {
  const slug = prompt.toLowerCase().replace(/\s+/g, '-')
  const title = prompt
  const content = `Voici un article généré automatiquement sur le thème : ${prompt}.`

  return { slug, title, content }
}
