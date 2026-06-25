import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Desaparecidos - Terremoto La Guaira 2025',
  description: 'Plataforma para reportar y buscar personas desaparecidas tras el terremoto de La Guaira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
