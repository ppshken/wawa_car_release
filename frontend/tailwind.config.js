/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        minimal: {
          bg: '#fafafa',
          card: '#ffffff',
          border: '#e5e7eb',
          subtle: '#f3f4f6',
          textMain: '#0f172a',
          textMuted: '#64748b',
          accent: '#0284c7'
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Thai"', 'Inter', 'sans-serif'],
      }

    },
  },
  plugins: [],
}


