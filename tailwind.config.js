/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f13',
        surface: '#16161e',
        border: '#ffffff10',
        primary: '#f0a500',
      },
    },
  },
  plugins: [],
}
