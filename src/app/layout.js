import ClientWrapper from './ClientWrapper'

export const metadata = {
  title: 'TechPlay',
  description: 'Le site TechPlay',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  )
}
