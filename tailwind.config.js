/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        marca: {
          azul: 'var(--color-brand-blue)',
          'azul-claro': 'var(--color-brand-blue-light)',
          'azul-oscuro': 'var(--color-brand-blue-dark)',
          desaparecidos: 'var(--color-section-desaparecidos)',
          colaboracion: 'var(--color-section-colaboracion)',
          dorado: '#BA7517',
          verde: '#1D9E75',
          rojo: '#E24B4A',
          fondo: '#F1EFE8',
        },
        status: {
          buscando: {
            bg: 'var(--color-status-buscando-bg)',
            fg: 'var(--color-status-buscando-fg)',
            border: 'var(--color-status-buscando-border)',
          },
          encontrado: {
            bg: 'var(--color-status-encontrado-bg)',
            fg: 'var(--color-status-encontrado-fg)',
            border: 'var(--color-status-encontrado-border)',
          },
          hospitalizado: {
            bg: 'var(--color-status-hospitalizado-bg)',
            fg: 'var(--color-status-hospitalizado-fg)',
            border: 'var(--color-status-hospitalizado-border)',
          },
          fallecido: {
            bg: 'var(--color-status-fallecido-bg)',
            fg: 'var(--color-status-fallecido-fg)',
            border: 'var(--color-status-fallecido-border)',
          },
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
