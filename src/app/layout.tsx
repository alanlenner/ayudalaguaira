import type { Metadata } from 'next'
import { Merriweather } from 'next/font/google'
import './globals.css'

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Venezuela unida — La Guaira',
  description: 'Plataforma ciudadana para reconectar familias tras el terremoto de La Guaira. Reporta, busca y ayuda.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={merriweather.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
