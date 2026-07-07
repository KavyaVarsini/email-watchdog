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
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#dce5ff',
          300: '#c2d1ff',
          400: '#9cb1ff',
          500: '#6375ff', // Primary neon-indigo
          600: '#4754eb',
          700: '#353ec7',
          800: '#2c32a3',
          900: '#252985',
        },
        dark: {
          50: '#afb2c1',
          100: '#8e92a8',
          200: '#6e738e',
          300: '#4e5473',
          400: '#2c3258',
          500: '#0d1127', // Deep slate-dark background
          600: '#090c1f',
          700: '#060817',
          800: '#03040d',
          900: '#010105',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
