/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7f5',
          100: '#e4efe2',
          200: '#c9dfca',
          300: '#a1c7a1',
          400: '#74a476',
          500: '#4d7d4d',
          600: '#335f35',
          700: '#254a25',
          800: '#1e3e1f',
          900: '#173218',
        },
        accent: '#0f172a',
      },
      boxShadow: {
        soft: '0 18px 40px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
