/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'roboto': ['Roboto', 'sans-serif'],
      },
      colors: {
        'game-primary': {
          50: '#fef3c7',
          100: '#fed7aa',
          200: '#fdba74',
          300: '#fb923c',
          400: '#f59e0b',
          500: '#d97706',
          600: '#c2410c',
          700: '#9a3412',
          800: '#7c2d12',
          900: '#92400e',
        },
        'game-accent': {
          'blue': '#3b82f6',
          'green': '#10b981',
          'red': '#ef4444',
          'yellow': '#f59e0b',
          'purple': '#8b5cf6',
        }
      },
      backgroundImage: {
        'game-gradient': 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fef3c7 100%)',
        'button-gradient': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-soft': 'bounce 0.6s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(245, 158, 11, 0.6)' },
        }
      },
      boxShadow: {
        'game': '0 10px 25px rgba(245, 158, 11, 0.15)',
        'game-lg': '0 20px 40px rgba(245, 158, 11, 0.2)',
        'glow': '0 0 20px rgba(245, 158, 11, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}