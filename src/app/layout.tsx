// src/app/layout.tsx
import './globals.css'
import { ThemeProvider } from '@/context/themeContext'
import Layout from '@/components/layout/Layout'

export const metadata = {
  title: 'TechPlay',
  description: 'Le meilleur site tech en dropshipping',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  )
}
