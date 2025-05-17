/**
 * DoctorMX Design System Tailwind Configuration
 * 
 * This is a sample configuration that would be merged with the existing
 * tailwind.config.js to implement the prefixed design system.
 */

const dxConfig = {
  theme: {
    extend: {
      colors: {
        // Prefixed color system
        'dx-primary': {
          50: "#E9F5F4",
          100: "#D4EBE9",
          200: "#A9D7D3",
          300: "#7EC3BD",
          400: "#53AFA7",
          500: "#26A69A", // Primary action color
          600: "#1F8A80",
          700: "#196E66",
          800: "#12534D",
          900: "#0A3733"
        },
        'dx-secondary': {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7", // Secondary action color
          700: "#0369A1",
          800: "#075985",
          900: "#0C4A6E"
        },
        'dx-accent': {
          50: "#FFF8E1",
          100: "#FFECB3",
          200: "#FFE082",
          300: "#FFD54F",
          400: "#FFCA28",
          500: "#FFB300", // Tertiary/accent color
          600: "#FFA000",
          700: "#FF8F00",
          800: "#FF6F00",
          900: "#FF5722"
        },
        'dx-neutral': {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937", // Same as brand-charcoal
          900: "#111827",
          950: "#030712",
        },
        'dx-success': {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          700: "#047857"
        },
        'dx-warning': {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          700: "#B45309"
        },
        'dx-error': {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          700: "#B91C1C"
        },
        'dx-info': {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#3B82F6",
          700: "#1D4ED8"
        },
      },
      fontFamily: {
        'dx-sans': ["'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"],
        'dx-heading': ["'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"],
        'dx-mono': ["ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"],
      },
      boxShadow: {
        'dx-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'dx-DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'dx-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dx-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dx-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'dx-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'dx-brand': '0 4px 14px 0 rgba(38, 166, 154, 0.2)',
        'dx-brand-hover': '0 6px 20px 0 rgba(38, 166, 154, 0.3)',
        'dx-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'dx-fade-in': 'dxFadeIn 0.5s ease-in-out',
        'dx-slide-up': 'dxSlideUp 0.5s ease-in-out',
        'dx-slide-down': 'dxSlideDown 0.5s ease-in-out',
        'dx-slide-left': 'dxSlideLeft 0.5s ease-in-out',
        'dx-slide-right': 'dxSlideRight 0.5s ease-in-out',
      },
      keyframes: {
        dxFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        dxSlideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        dxSlideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        dxSlideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        dxSlideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      borderRadius: {
        'dx-sm': '0.125rem',
        'dx-DEFAULT': '0.25rem',
        'dx-md': '0.375rem',
        'dx-lg': '0.5rem',
        'dx-xl': '0.75rem',
        'dx-2xl': '1rem',
        'dx-3xl': '1.5rem',
        'dx-full': '9999px',
      },
    },
  },
  plugins: [
    // Function to add custom utilities
    function ({ addUtilities }) {
      const newUtilities = {
        // Background gradients
        '.dx-bg-brand-gradient': {
          background: 'linear-gradient(to right, #26A69A, #0284C7)',
        },
        '.dx-bg-hero-gradient': {
          background: 'linear-gradient(to bottom right, #E9F5F4, #ffffff)',
        },
        '.dx-bg-cta-gradient': {
          background: 'linear-gradient(to right, #26A69A, #0284C7)',
        },
        
        // Text gradients
        '.dx-text-brand-gradient': {
          background: 'linear-gradient(to right, #26A69A, #0284C7)',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
        },
        
        // Typography styles
        '.dx-heading-1': {
          'font-family': "'Montserrat', sans-serif",
          'font-size': '2.25rem',
          'font-weight': '700',
          'line-height': '1.2',
          'letter-spacing': '-0.025em',
        },
        '.dx-heading-2': {
          'font-family': "'Montserrat', sans-serif",
          'font-size': '1.875rem',
          'font-weight': '700',
          'line-height': '1.25',
          'letter-spacing': '-0.025em',
        },
        '.dx-heading-3': {
          'font-family': "'Montserrat', sans-serif",
          'font-size': '1.5rem',
          'font-weight': '600',
          'line-height': '1.3',
          'letter-spacing': '-0.025em',
        },
        '.dx-heading-4': {
          'font-family': "'Montserrat', sans-serif",
          'font-size': '1.25rem',
          'font-weight': '600',
          'line-height': '1.4',
        },
        '.dx-heading-5': {
          'font-family': "'Montserrat', sans-serif",
          'font-size': '1.125rem',
          'font-weight': '600',
          'line-height': '1.4',
        },
        '.dx-heading-6': {
          'font-family': "'Montserrat', sans-serif",
          'font-size': '1rem',
          'font-weight': '600',
          'line-height': '1.5',
        },
        
        '.dx-body-large': {
          'font-family': "'Nunito', sans-serif",
          'font-size': '1.125rem',
          'font-weight': '400',
          'line-height': '1.6',
        },
        '.dx-body': {
          'font-family': "'Nunito', sans-serif",
          'font-size': '1rem',
          'font-weight': '400',
          'line-height': '1.6',
        },
        '.dx-body-small': {
          'font-family': "'Nunito', sans-serif",
          'font-size': '0.875rem',
          'font-weight': '400',
          'line-height': '1.5',
        },
        
        '.dx-caption': {
          'font-family': "'Nunito', sans-serif",
          'font-size': '0.75rem',
          'font-weight': '400',
          'line-height': '1.5',
          'letter-spacing': '0.025em',
        },
        '.dx-button-text': {
          'font-family': "'Montserrat', sans-serif",
          'font-size': '0.875rem',
          'font-weight': '600',
          'line-height': '1.5',
          'letter-spacing': '0.025em',
        },
        '.dx-label': {
          'font-family': "'Nunito', sans-serif",
          'font-size': '0.875rem',
          'font-weight': '500',
          'line-height': '1.5',
        },
        
        // Focus states
        '.dx-focus-ring': {
          'outline': '2px solid #26A69A',
          'outline-offset': '2px',
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
};

module.exports = dxConfig;