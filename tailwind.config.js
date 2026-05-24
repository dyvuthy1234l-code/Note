/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        champagne: '#f5e6c8',
      },
      boxShadow: {
        luxury: '0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.06) inset',
        glow: '0 0 20px rgba(124,58,237,0.35)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
