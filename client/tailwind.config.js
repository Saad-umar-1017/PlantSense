/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        earth: {
          50: '#fdf8f0',
          100: '#f5ead6',
          200: '#ead3ab',
          300: '#ddb97a',
          400: '#d09f52',
          500: '#c08735',
          600: '#a56d2b',
          700: '#875526',
          800: '#6f4525',
          900: '#5d3a23'
        },
        bark: {
          700: '#3e2723',
          800: '#2c1a11',
          900: '#1a0f09'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif']
      }
    }
  },
  plugins: []
}
