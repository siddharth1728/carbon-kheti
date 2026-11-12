/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f4f9f5',
          100: '#d8f3dc',
          200: '#b7e4c7',
          300: '#95d5b2',
          400: '#74c69d',
          500: '#52b788',
          600: '#40916c',
          700: '#2d6a4f',
          800: '#1b4332',
          900: '#143224',
          950: '#0b1d15',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
