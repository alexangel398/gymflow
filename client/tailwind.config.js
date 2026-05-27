/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f0f7',
          100: '#d1e1ef',
          500: '#2E86C1',
          600: '#2472a4',
          700: '#1B4F72',
          800: '#163f5b',
          900: '#0f2d42',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}