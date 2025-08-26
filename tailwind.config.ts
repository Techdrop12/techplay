// tailwind.config.ts — Ultra Premium FINAL
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import scrollbar from 'tailwind-scrollbar'
import type { PluginAPI } from 'tailwindcss/types/config'

const config: Config = {
  darkMode: 'class',

  // Couvre tout le code source (app, components, pages, mdx, storybook sont sous /src)
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],

  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.25rem', lg: '2rem', xl: '2.5rem', '2xl': '3rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1440px' },
    },

    extend: {
      screens: { xs: '480px' },

      fontFamily: {
        // Les variables next/font sont exposées via CSS vars (fallbacks inclus)
        sans: ['InterVariable', 'Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['SoraVariable', 'var(--font-sora)', 'Inter', 'ui-sans-serif', 'system-ui'],
      },

      // Palette utilitaire (hex) + mapping tokens HSL (pilotés par design-tokens.css)
      colors: {
        brand: { DEFAULT: '#0f172a', light: '#1e293b', dark: '#0b0f14' },

        // ✅ DEFAULT piloté par --accent (réagit au thème). Steps 50..900 conservés.
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: '#16a34a',
        warning: '#eab308',
        danger:  '#dc2626',

        surface: { DEFAULT: '#ffffff', muted: '#f8fafc', dark: '#0b0f14' },
        border:  { DEFAULT: '#e5e7eb',  dark: '#262b35' },

        token: {
          bg: 'hsl(var(--bg) / <alpha-value>)',
          text: 'hsl(var(--text) / <alpha-value>)',
          'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
          surface: 'hsl(var(--surface) / <alpha-value>)',
          'surface-2': 'hsl(var(--surface-2) / <alpha-value>)',
          border: 'hsl(var(--border) / <alpha-value>)',
          accent: 'hsl(var(--accent) / <alpha-value>)',
        },
      },

      spacing: { header: '4.5rem' },
      borderRadius: { xl: '1rem', '2xl': '1.25rem', '3xl': '1.75rem' },

      boxShadow: {
        soft: '0 6px 20px rgba(0,0,0,0.06)',
        elevated: '0 10px 30px rgba(0,0,0,0.10)',
        card: '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
        'glow-accent': '0 0 0 6px rgba(37,99,235,0.10)',
      },

      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'soft-spring': 'cubic-bezier(.2,.8,.2,1)',
      },

      zIndex: { header: '60', overlay: '70', modal: '80', toast: '90' },

      backgroundImage: {
        'radial-faded': 'radial-gradient(80% 60% at 50% 40%, transparent, rgba(0,0,0,.55))',
        'conic-accent':
          'conic-gradient(from 140deg, rgba(59,130,246,.35), transparent 35%, rgba(14,165,233,.35), transparent 75%)',
        'gloss-top': 'linear-gradient(to bottom, rgba(255,255,255,.45), transparent)',
        'grid-surface':
          'linear-gradient(var(--grid-color,rgba(0,0,0,.06)) 1px,transparent 1px),linear-gradient(90deg,var(--grid-color,rgba(0,0,0,.06)) 1px,transparent 1px)',
      },

      animation: {
        fadeIn: 'fadeIn 0.4s ease-in-out',
        slideUp: 'slideUp 0.5s ease-in-out',
        pulse: 'pulse 1.5s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        bounce: 'bounce 1s infinite',
        'fade-up': 'fadeUp 0.45s var(--ease, ease-out)',
        'scale-in': 'scaleIn 0.35s ease-out',
        'accordion-down': 'accordionDown 0.25s ease-out',
        'accordion-up': 'accordionUp 0.25s ease-out',
        shimmer: 'shimmer 1.2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'tilt-subtle': 'tilt 12s ease-in-out infinite',
        'marquee-slow': 'marquee 22s linear infinite',
      },

      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.5' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%,75%': { transform: 'translateX(-5px)' }, '50%': { transform: 'translateX(5px)' } },
        bounce: { '0%,100%': { transform: 'translateY(-5%)' }, '50%': { transform: 'translateY(0)' } },
        fadeUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.98)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        accordionDown: { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        accordionUp: { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-6px,0)' } },
        tilt: { '0%,100%': { transform: 'rotate(-.3deg)' }, '50%': { transform: 'rotate(.3deg)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },

      typography: ({ theme }: { theme: (path: string) => any }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.brand.DEFAULT') as string,
            a: { color: theme('colors.accent.600') as string, textDecoration: 'none', fontWeight: 600, '&:hover': { color: theme('colors.accent.700') as string } },
            h1: { fontFamily: String(theme('fontFamily.heading')), fontWeight: 800, letterSpacing: '-0.02em' },
            h2: { fontFamily: String(theme('fontFamily.heading')), fontWeight: 700, letterSpacing: '-0.01em' },
            h3: { fontFamily: String(theme('fontFamily.heading')), fontWeight: 700 },
            code: { backgroundColor: theme('colors.surface.muted') as string, padding: '0.15rem 0.35rem', borderRadius: '0.4rem' },
            'code::before, code::after': { content: 'none' },
            blockquote: { borderLeftColor: theme('colors.accent.300') as string, color: '#334155' },
          },
        },
        invert: {
          css: {
            color: '#e5e7eb',
            a: { color: theme('colors.accent.400') as string, '&:hover': { color: theme('colors.accent.300') as string } },
            code: { backgroundColor: '#0f172a' },
            blockquote: { borderLeftColor: theme('colors.accent.500') as string, color: '#cbd5e1' },
          },
        },
      }),
    },
  },

  plugins: [
    forms,
    typography,
    scrollbar({ nocompatible: true }),

    plugin((api: PluginAPI) => {
      const { addUtilities, addComponents, addVariant } = api

      // Variantes premium (utilisées partout dans ton UI)
      addVariant('hocus', '&:where(:hover, :focus-visible)')
      addVariant('group-hocus', ':merge(.group):where(:hover, :focus-within) &')
      addVariant('aria-expanded', '&[aria-expanded="true"]')
      addVariant('aria-pressed', '&[aria-pressed="true"]')
      addVariant('data-open', '&[data-state="open"]')
      addVariant('data-closed', '&[data-state="closed"]')
      addVariant('disabled', '&:disabled')
      addVariant('supports-backdrop', '@supports(backdrop-filter: blur(2px)) &')

      // Utils (sans doublonner ce qui est déjà dans globals.css)
      addUtilities({
        '.ring-conic': {
          background: 'var(--ring-conic)',
        },
        // 3D / motion helpers
        '.preserve-3d': { transformStyle: 'preserve-3d' },
        '.backface-hidden': { backfaceVisibility: 'hidden' },
        '.perspective-1000': { perspective: '1000px' },
        '.will-change-transform': { willChange: 'transform' },
      })

      // Composants (on conserve seulement pressable qui n’existe pas en CSS)
      addComponents({
        '.card-pressable': {
          backgroundColor: 'hsl(var(--surface))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '1.25rem', // = var(--radius-2xl)
          boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
          transition: 'transform 250ms var(--ease, cubic-bezier(.2,.8,.2,1)), box-shadow 250ms',
          willChange: 'transform',
        },
        '.card-pressable:hover': { transform: 'translateY(-2px) scale(1.01)' },
        '.card-pressable:active': { transform: 'translateY(0) scale(0.985)' },
      })
    }),
  ],

  future: { hoverOnlyWhenSupported: true },

  // Génère les classes utilisées dynamiquement / par tokens
  safelist: [
    // Accent palette
    { pattern: /(bg|text|border)-accent-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /(from|via|to)-accent-(400|500|600|700)/ },

    // Mapping tokens (HSL via CSS vars)
    { pattern: /(bg|text|border)-token-(bg|text|text-muted|surface|surface-2|border|accent)/ },

    // Variantes d’opacité les plus fréquentes (utilisées dans le Header/Layout)
    'bg-token-surface/60',
    'bg-token-surface/65',
    'bg-token-surface/70',
    'bg-token-surface/80',
    'bg-token-surface/85',
    'bg-token-surface/90',
    'text-token-text/40',
    'text-token-text/60',
    'text-token-text/70',
  ],
}

export default config
