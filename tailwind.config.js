/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Habilita el modo oscuro basado en clases
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF4500',
          hover: '#F48C06',
        },
        secondary: {
          DEFAULT: '#4B2E19',
          hover: '#5D2A0C',
        },
        background: '#181818',
        foreground: '#ffffff',
        error: '#FF6347',
        success: '#4ade80',
        'input-bg': '#232323',
        'input-border': '#333333',
        'card-bg': '#232323',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        montserrat: ['Montserrat', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
