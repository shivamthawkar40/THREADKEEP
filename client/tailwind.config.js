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

        // PRIMARY BRAND — PEACOCK NAVY
        primary: {
          50: '#E8F4F3',
          100: '#CDE8E6',
          200: '#A1D5D1',
          300: '#6DBDB8',
          400: '#32B8B0',
          DEFAULT: '#064B50',
          600: '#07585C',
          700: '#073F45',
          800: '#082F38',
          900: '#071F2B',
        },

        // PRIMARY ACTIONS
        teal: {
          light: '#32B8B0',
          DEFAULT: '#087E83',
          dark: '#064B50',
          deep: '#071F2B',
        },

        // PAGE BACKGROUNDS
        ivory: {
          light: '#FFFFFF',
          DEFAULT: '#F4F5F0',
          dark: '#E6EBE5',
          muted: '#D5DFD9',
        },

        // BORDERS AND DIVIDERS
        sage: {
          light: '#E0EBE7',
          DEFAULT: '#B8CCC5',
          dark: '#7FA69B',
        },

        // HOVER BACKGROUNDS
        mint: {
          light: '#EAF8F6',
          DEFAULT: '#D5F0EC',
          dark: '#A9DED6',
        },

        // TEXT COLORS
        charcoal: {
          light: '#526C6B',
          DEFAULT: '#193A3D',
          dark: '#071F2B',
        },

        // SECONDARY ACCENT
        aqua: {
          light: '#DDF7F3',
          DEFAULT: '#32B8B0',
          dark: '#087E83',
        },

        // ERROR STATES
        coral: {
          light: '#FCE4E0',
          DEFAULT: '#E88C78',
          dark: '#C85E50',
        },

        // GOLDEN FEATHER ACCENT
        gold: {
          light: '#F8F0D5',
          DEFAULT: '#D6B44A',
          dark: '#A9892D',
        },

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
        soft: '0 2px 8px -2px rgba(7, 31, 43, 0.08), 0 4px 16px -2px rgba(6, 75, 80, 0.06)',

        card: '0 1px 3px rgba(7, 31, 43, 0.08), 0 8px 24px -4px rgba(6, 75, 80, 0.06)',

        elevated: '0 12px 32px -4px rgba(7, 31, 43, 0.16), 0 4px 12px -2px rgba(6, 75, 80, 0.10)',
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