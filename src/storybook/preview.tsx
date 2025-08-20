import '../app/globals.css';
import type { Preview, StoryContext, StoryFn } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'padded',
    options: {
      storySort: { order: ['Bienvenue', 'Design System', 'UI', 'Forms', 'Data', 'Feedback', 'Layout', 'Pages'] },
    },
    backgrounds: {
      default: 'app',
      values: [
        { name: 'app', value: '#0b0b0c' },
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Thème global',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story: StoryFn, context: StoryContext) => {
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        const isDark =
          context.globals.theme === 'dark' ||
          (context.globals.theme === 'system' &&
            window.matchMedia?.('(prefers-color-scheme: dark)').matches);
        root.classList.toggle('dark', !!isDark);
      }
      return (
        <div className="min-h-screen bg-background text-foreground antialiased">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
