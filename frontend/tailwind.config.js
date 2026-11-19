/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Blinkit Green
          600: '#16a34a',
          700: '#15803d',
          850: '#1e3a27'
        },
        accent: {
          DEFAULT: '#eab308', // Amber Gold
          light: '#fde047',
          dark: '#ca8a04'
        },
        dark: {
          bg: '#090d10',
          card: '#12181d',
          border: '#1f2933',
          text: '#f3f4f6'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
