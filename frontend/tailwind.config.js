/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0B1512',
          raised: '#131E19',
          floating: '#1A2922',
          100: '#0B1512',
          200: '#131E19',
          300: '#1A2922',
          400: '#22342C',
        },
        gn: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
          primary: '#22c55e',
          glow: 'rgba(34,197,94,0.15)',
          text: '#4ade80',
        },
        white: {
          primary: 'rgba(255,255,255,0.92)',
          secondary: 'rgba(255,255,255,0.50)',
          muted: 'rgba(255,255,255,0.25)',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        floatSlow: 'float 12s ease-in-out infinite',
        glowPulse: 'glowPulse 3s ease-in-out infinite',
        gradShift: 'gradShift 10s ease infinite',
        fadeUp: 'fadeUp 0.6s ease-out forwards',
        slideIn: 'slideIn 0.4s ease-out forwards',
        ripple: 'ripple 0.6s linear forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.8, filter: 'brightness(1)' },
          '50%': { opacity: 1, filter: 'brightness(1.3) drop-shadow(0 0 15px rgba(34,197,94,0.4))' },
        },
        gradShift: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: 0.5 },
          '100%': { transform: 'scale(4)', opacity: 0 },
        }
      },
      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },
      boxShadow: {
        'green-glow': '0 0 40px rgba(34,197,94,0.15)',
        'green-glow-lg': '0 0 80px rgba(34,197,94,0.25)',
      }
    },
  },
  plugins: [],
}
