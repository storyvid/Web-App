/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#fafaf9',
          200: '#e5e5e5',
          500: '#78716c',
          800: '#292524',
          900: '#1F1C15'
        },
        amber: {
          500: '#f59e0b',
          600: '#E4B949'
        }
      },
      fontFamily: {
        'serif-display': ['DM Serif Display', 'serif'],
        'sans': ['system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}