export default {
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Professional Medical Color Palette
        primary: {
          50: '#F0F4FF',
          100: '#E0EAFF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Main brand color
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B', // Professional gray
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        accent: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9', // Medical blue accent
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        warning: {
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
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        // Legacy compatibility
        brand: {
          50: '#F0F4FF',
          100: '#E0EAFF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        medical: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        pharmacy: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        ink: {
          primary: '#171717',
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
      backgroundImage: {
        // Gradient backgrounds
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-medical': 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #F8FAFC 100%)',
        'gradient-hero': 'linear-gradient(135deg, #F0F4FF 0%, #E0EAFF 25%, #F8FAFC 50%, #F0F9FF 75%, #E0F2FE 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'gradient-glass': 'linear-gradient(145deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      animation: {
        // Clinical motion system
        'fade-in': 'fadeIn 130ms cubic-bezier(.16,1,.3,1)',
        'slide-up': 'slideUp 220ms cubic-bezier(.16,1,.3,1)',
        'scale-in': 'scaleIn 220ms cubic-bezier(.16,1,.3,1)',
        'count-up': 'countUp 600ms cubic-bezier(.16,1,.3,1)',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'bounce-gentle': 'bounceGentle 2s infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1', 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)'
          },
          '50%': { 
            opacity: '0.9', 
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 10px rgba(99, 102, 241, 0)'
          },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-8px)' },
          '60%': { transform: 'translateY(-4px)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    }
  },
  plugins: [
    // Custom plugin for icon-text utilities
    function({ addComponents }) {
      addComponents({
        '.icon-text': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          verticalAlign: 'middle',
        },
        '.icon-text svg, .icon-text i, .icon-text img': {
          display: 'inline-block',
          flexShrink: '0',
        },
      })
    }
  ]
}
