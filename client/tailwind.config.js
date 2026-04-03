/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  important: '#root',
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#1565c0',
          light: '#1976d2',
          dark: '#0d47a1',
        },
        secondary: {
          main: '#7b1fa2',
          light: '#9c27b0',
          dark: '#4a148c',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

