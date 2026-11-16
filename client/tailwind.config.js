/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: '#DEE5E8',
          100: '#B8C8D7',
          200: '#B7C5CC',
          300: '#95A1A6',
          400: '#737F85',
          DEFAULT: '#181818',
          600: '#2B2C2C',
          700: '#525354',
          800: '#2B2C2C',
          900: '#181818',
        },
        teal: {
          light: '#B8C8D7',
          DEFAULT: '#181818',
          dark: '#2B2C2C',
          deep: '#181818',
        },
        ivory: {
          light: '#FFFFFF',
          DEFAULT: '#DEE5E8',
          dark: '#B7C5CC',
          muted: '#95A1A6',
        },
        sage: {
          light: '#DEE5E8',
          DEFAULT: '#B7C5CC',
          dark: '#95A1A6',
        },
        mint: {
          light: '#DEE5E8',
          DEFAULT: '#B8C8D7',
          dark: '#B7C5CC',
        },
        charcoal: {
          light: '#737F85',
          DEFAULT: '#2B2C2C',
          dark: '#181818',
        },
        aqua: {
          light: '#DEE5E8',
          DEFAULT: '#B8C8D7',
          dark: '#737F85',
        },
        coral: {
          light: '#DEE5E8',
          DEFAULT: '#737F85',
          dark: '#525354',
        },
        gold: {
          light: '#DEE5E8',
          DEFAULT: '#B7C5CC',
          dark: '#95A1A6',
        },
        graphite: '#525354',
        steel: '#B7C5CC',
        slate: '#737F85',
      },

      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'monospace',
        ],
        serif: [
          '"Newsreader"',
          '"Playfair Display"',
          'serif',
        ],
      },

      boxShadow: {
        soft: '0 2px 8px -2px rgba(24, 24, 24, 0.06), 0 4px 16px -2px rgba(82, 83, 84, 0.05)',

        card: '0 1px 3px rgba(24, 24, 24, 0.06), 0 8px 24px -4px rgba(82, 83, 84, 0.05)',

        elevated: '0 12px 32px -4px rgba(24, 24, 24, 0.12), 0 4px 12px -2px rgba(82, 83, 84, 0.08)',
      },

      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(4px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(12px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },

  plugins: [],
};

