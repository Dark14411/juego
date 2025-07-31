import type { Metadata, Viewport } from 'next'
import './globals.css'
import './custom-scrollbar.css'

export const metadata: Metadata = {
  title: 'Tamagotchi Pro & Retro Arcade - Tu Experiencia Gaming Completa',
  description: 'Modo Tamagotchi profesional con cuidado automático y Modo Retro Arcade con juegos clásicos optimizados. ¡Experiencia gaming sin límites!',
  generator: 'Next.js',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tamagotchi Pro & Retro Arcade'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }
    ]
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f59e0b'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
