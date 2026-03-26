/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0eaff',
          500: '#4f6ef7',
          600: '#3b5bf5',
          700: '#2a47e8',
        },
        surface: {
          50: '#f8f9fc',
          100: '#f1f3f9',
          200: '#e8ebf4',
          800: '#1e2235',
          900: '#141728',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
