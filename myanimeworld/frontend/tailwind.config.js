/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e85d04',
          dark: '#c44d00',
        },
        dark: {
          DEFAULT: '#0f0f0f',
          card: '#1a1a2e',
          surface: '#16213e',
        },
      },
    },
  },
  plugins: [],
};
