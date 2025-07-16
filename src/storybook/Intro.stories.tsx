import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Bienvenue / Intro',
  render: () => (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bienvenue sur le design system TechPlay 🎨</h1>
      <p className="mt-2 text-muted-foreground text-sm">Tous les composants UI en live preview ici.</p>
    </div>
  ),
}
export default meta
export const Default: StoryObj = {}
