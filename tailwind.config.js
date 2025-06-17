// ✅ tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], // Prend en compte tous les fichiers utiles
  darkMode: 'class', // Active le dark mode via la classe .dark
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], // Typo moderne
      },
      colors: {
        brand: {
          DEFAULT: '#0f172a', // Couleur personnalisée principale
          light: '#1e293b',
          dark: '#0e1116',
        },
      },
      spacing: {
        header: '4.5rem', // Hauteur personnalisée pour header
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-in-out',
        slideUp: 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),        // Formulaires propres
    require('@tailwindcss/typography'),   // Style markdown / blog
    require('tailwind-scrollbar'),        // Personnalisation scrollbar
  ],
};
