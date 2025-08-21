// tailwind.config.ts
import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import scrollbar from 'tailwind-scrollbar'
import type { PluginAPI } from 'tailwindcss/types/config'

const config: Config = {
  darkMode: 'class',

  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.25rem', lg: '2rem', xl: '2.5rem', '2xl': '3rem' },
    },

    extend: {
      screens: { xs: '480px' },

      fontFamily: {
        // le body est piloté par --font-inter (via globals)
        // on garde une famille Tailwind “sécurité”
        sans: ['InterVariable', 'Inter', 'ui-sans-serif', 'system-ui'],
      },

      colors: {
        brand: { DEFAULT: '#0f172a', light: '#1e293b', dark: '#0e1116' },
        accent: {
          DEFAULT: '#2563eb',
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
        danger: '#dc2626',

        surface: { DEFAULT: '#ffffff', muted: '#f8fafc', dark: '#0b0f14' },
        border: { DEFAULT: '#e5e7eb', dark: '#262b35' },
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
      },

      zIndex: { header: '60', overlay: '70', modal: '80', toast: '90' },

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
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '.5' } },
        shake: { '0%, 100%': { transform: 'translateX(0)' }, '25%, 75%': { transform: 'translateX(-5px)' }, '50%': { transform: 'translateX(5px)' } },
        bounce: { '0%, 100%': { transform: 'translateY(-5%)' }, '50%': { transform: 'translateY(0)' } },
        fadeUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleIn: { '0%': { transform: 'scale(0.98)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        accordionDown: { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        accordionUp: { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },

      typography: ({ theme }: { theme: (path: string) => string | number | undefined }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.brand.DEFAULT') as string,
            a: {
              color: theme('colors.accent.600') as string,
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { color: theme('colors.accent.700') as string },
            },
            h1: { fontWeight: 800, letterSpacing: '-0.02em' },
            h2: { fontWeight: 700, letterSpacing: '-0.01em' },
            h3: { fontWeight: 700 },
            code: {
              backgroundColor: theme('colors.surface.muted') as string,
              padding: '0.15rem 0.35rem',
              borderRadius: '0.4rem',
            },
          },
        },
        invert: {
          css: {
            color: '#e5e7eb',
            a: {
              color: theme('colors.accent.400') as string,
              '&:hover': { color: theme('colors.accent.300') as string },
            },
            code: { backgroundColor: '#0f172a' },
          },
        },
      }),
    },
  },

  plugins: [
    forms,
    typography,
    scrollbar,

    plugin((api: PluginAPI) => {
      const { addUtilities, theme } = api

      addUtilities({
        '.glass': {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(255,255,255,0.75)',
          border: '1px solid rgba(255,255,255,0.35)',
        },
        '.glass-dark': {
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(9,12,16,0.65)',
          border: '1px solid rgba(255,255,255,0.08)',
        },

        '.card': {
          backgroundColor: String(theme('colors.surface.DEFAULT')),
          border: `1px solid ${String(theme('colors.border.DEFAULT'))}`,
          borderRadius: String(theme('borderRadius.2xl')),
          boxShadow: String(theme('boxShadow.card')),
        },
        '.card-dark': {
          backgroundColor: String(theme('colors.brand.dark')),
          border: `1px solid ${String(theme('colors.border.dark'))}`,
          borderRadius: String(theme('borderRadius.2xl')),
          boxShadow: String(theme('boxShadow.card')),
        },

        '.focus-ring': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${String(theme('colors.surface.DEFAULT'))}, 0 0 0 4px ${String(
            theme('colors.accent.500')
          )}`,
        },
        '.focus-ring-dark': {
          outline: 'none',
          boxShadow: `0 0 0 2px ${String(theme('colors.brand.dark'))}, 0 0 0 4px ${String(
            theme('colors.accent.500')
          )}`,
        },

        '.skeleton': {
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 37%, rgba(0,0,0,0.06) 63%)',
          backgroundSize: '400% 100%',
          animation: 'shimmer 1.2s linear infinite',
        },
      })
    }),
  ],

  future: { hoverOnlyWhenSupported: true },

  safelist: [
    { pattern: /(bg|text|border)-accent-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /(from|via|to)-accent-(400|500|600|700)/ },
  ],
}

export default config
