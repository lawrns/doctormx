export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // New sophisticated clinical color scheme
        brand: {
          primary: '#2B7FFF',
          'primary-600': '#1D5ED8',
          teal: '#0BA6A6',
        },
        neutrals: {
          bg: '#0A0F1A',
          'bg-alt': '#0C1320',
          card: '#0E1526',
          stroke: '#1C263A',
          'text-h': '#F5F7FA',
          'text-m': '#C9D3E0',
          'text-l': '#99A6B8',
        },
        utility: {
          success: '#18C58B',
          warning: '#FFB020',
          danger: '#EF4444',
          info: '#60A5FA',
        },
        // Legacy colors for backwards compatibility
        medical: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        pharmacy: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        alert: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        ink: {
          primary: '#0A0A0A',
          secondary: '#525252',
          muted: '#737373',
          subtle: '#A3A3A3',
          border: '#E5E5E5',
          bg: '#FAFAFA',
          inverse: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ]
      },
      fontSize: {
        // Clinical typography scale
        'eyebrow': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
        'small': ['0.875rem', { lineHeight: '1.25rem' }],
        'body': ['1rem', { lineHeight: '1.5rem' }],
        'h4': ['1.25rem', { lineHeight: '1.5rem' }],
        'h3': ['1.5rem', { lineHeight: '1.25rem' }],
        'h2': ['2rem', { lineHeight: '1.25rem', letterSpacing: '-0.02em' }],
        'h1': ['2.75rem', { lineHeight: '1.1', letterSpacing: '-0.04em' }],
        // Legacy sizes for backwards compatibility
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
        '6xl': ['3.75rem', { lineHeight: '4rem' }],
        '7xl': ['4.5rem', { lineHeight: '4.75rem' }],
      },
      spacing: {
        // Clinical spacing scale (4px base)
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '14': '3.5rem',   // 56px
        '18': '4.5rem',   // 72px
        '24': '6rem',     // 96px
        // Legacy spacing
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      boxShadow: {
        // Clinical shadows with material depth
        'z1': '0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.4)',
        'z2': '0 2px 6px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
        'brand': '0 0 0 2px rgba(43,127,255,0.15), 0 8px 24px rgba(27, 100, 255, 0.18)',
        // Legacy shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.08)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.08)',
        'pharmacy': '0 8px 24px rgba(20, 184, 166, 0.15)',
        'medical': '0 8px 24px rgba(20, 184, 166, 0.15)',
        'alert': '0 8px 24px rgba(245, 158, 11, 0.15)',
      },
      borderRadius: {
        // Clinical radius scale
        'sm': '0.5rem',     // 8px
        'md': '0.75rem',    // 12px
        'lg': '1rem',       // 16px
        'xl': '1.25rem',    // 20px
        'pill': '9999px',   // pill shape
        // Legacy radius
        'DEFAULT': '0.5rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      maxWidth: {
        container: '67.5rem', // 1080px clinical container
        reading: '65ch'       // Optimal reading width
      },
      animation: {
        // Clinical motion system
        'fade-in': 'fadeIn 130ms cubic-bezier(.16,1,.3,1)',
        'slide-up': 'slideUp 220ms cubic-bezier(.16,1,.3,1)',
        'scale-in': 'scaleIn 220ms cubic-bezier(.16,1,.3,1)',
        'count-up': 'countUp 600ms cubic-bezier(.16,1,.3,1)',
        // Legacy animations
        'slide-down': 'slideDown 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.98)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        countUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    }
  },
  plugins: []
}
