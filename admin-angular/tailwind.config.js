/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        adminBrand: {
          50: '#f0f9ff',
          500: '#0284c7',
          600: '#0369a1',
          900: '#0c4a6e'
        }
      }
    },
  },
  plugins: [],
}
