/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        marca: {
          azul: '#185FA5',
          'azul-claro': '#B5D4F4',
          'azul-oscuro': '#0C447C',
          dorado: '#BA7517',
          verde: '#1D9E75',
          rojo: '#E24B4A',
          fondo: '#F1EFE8',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
