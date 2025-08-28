/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        // => @media (min-width: 375px) { ... }
      },
      colors: {
        primary: {
          DEFAULT: '#FF4500',
          hover: '#F48C06',
        },
        secondary: {
          DEFAULT: '#4B2E19',
          hover: '#5D2A0C',
        },
        background: '#0f172a',
        foreground: '#f1f5f9',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
        'input-bg': '#1e293b',
        'input-border': '#334155',
        'card-bg': '#1e293b',
        'text-primary': '#f1f5f9',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
        gray: {
          50: '#0f172a',
          100: '#1e293b',
          200: '#334155',
          300: '#475569',
          400: '#64748b',
          500: '#94a3b8',
          600: '#cbd5e1',
          700: '#e2e8f0',
          800: '#f1f5f9',
          900: '#f8fafc',
        },
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
