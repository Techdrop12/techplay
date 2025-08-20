import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Bienvenue/Intro',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur le design system TechPlay ✨</h1>
      <p className="mt-2 text-muted-foreground">
        Tous les composants UI sont prévisualisables ici. Utilise le sélecteur de thème (barre du haut) et les
        contrôles à droite pour jouer avec les props.
      </p>
      <ul className="mt-6 grid gap-3 text-sm text-muted-foreground">
        <li>• Raccourci actions: <code className="px-1 rounded bg-muted">onClick</code>, <code className="px-1 rounded bg-muted">onChange</code>, etc.</li>
        <li>• Tokens Tailwind prêts: <code className="px-1 rounded bg-muted">bg-background</code>, <code className="px-1 rounded bg-muted">text-foreground</code>…</li>
        <li>• Layout <em>padded</em> par défaut pour coller au rendu app.</li>
      </ul>
    </div>
  ),
};
