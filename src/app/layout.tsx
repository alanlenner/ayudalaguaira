import type { Metadata } from 'next'
import { Merriweather } from 'next/font/google'
import WhatsAppWidget from '@/components/WhatsAppWidget'
import { normalizarWhatsappWidgetUrl } from '@/lib/constants'
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

const whatsappWidgetHref = normalizarWhatsappWidgetUrl(process.env.NEXT_PUBLIC_WHATSAPP_WIDGET_URL)
const whatsappWidgetLabel = process.env.NEXT_PUBLIC_WHATSAPP_WIDGET_LABEL?.trim() || 'Hablar por WhatsApp'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={merriweather.variable}>
      <body className="antialiased">
        {children}
        {whatsappWidgetHref && (
          <WhatsAppWidget href={whatsappWidgetHref} label={whatsappWidgetLabel} />
        )}
      </body>
    </html>
  )
}
