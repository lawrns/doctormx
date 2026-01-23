/** @type {import('tailwindcss').Config} */
const designSystem = require('./src/styles/design-system.ts');

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Import unified design system colors
        primary: designSystem.colors.primary,
        secondary: designSystem.colors.secondary,
        accent: designSystem.colors.accent,
        neutral: designSystem.colors.neutral,
        semantic: designSystem.colors.semantic,
        background: designSystem.colors.background,
        text: designSystem.colors.text,
        border: designSystem.colors.border,
        mexico: designSystem.colors.mexico,
        
        // Keep legacy brand colors for backward compatibility
        "brand-jade": designSystem.colors.primary,
        "brand-sky": designSystem.colors.secondary,
        "brand-sun": designSystem.colors.accent,
        "brand-charcoal": designSystem.colors.text.primary,
        "brand-night": designSystem.colors.neutral[900],
      },
      fontFamily: designSystem.typography.fontFamily,
      fontSize: designSystem.typography.fontSize,
      fontWeight: designSystem.typography.fontWeight,
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
        'slide-down': 'slideDown 0.5s ease-in-out',
        'slide-left': 'slideLeft 0.5s ease-in-out',
        'slide-right': 'slideRight 0.5s ease-in-out',
        'bounce-light': 'bounce 1s infinite ease-in-out alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ring-pulse': 'ring-pulse 1.4s ease-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'ring-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(52, 199, 89, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(52, 199, 89, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52, 199, 89, 0)' },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))',
        'cta-gradient': 'linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to))',
        'teal-gradient': 'linear-gradient(90deg, #0BA3C7 0%, #12866C 100%)',
      },
      boxShadow: designSystem.shadows,
      spacing: designSystem.spacing,
      maxWidth: {
        prose: '58ch',
      },
    },
    screens: designSystem.breakpoints,
  },
  plugins: [
    function ({ addUtilities, addBase }) {
      // Typography scale implementation
      addBase({
        'html': { fontSize: '100%' }, // 1rem = 16px default
        '@media (max-width: 1279px)': {
          'html': { fontSize: '94%' },  // tablets
        },
        '@media (max-width: 767px)': {
          'html': { fontSize: '88%' },  // phones
        },
        '.prose p': { 
          lineHeight: '1.45', 
          maxWidth: '58ch' 
        },
      })
      
      const newUtilities = {
        '.text-brand-gradient': {
          background: 'linear-gradient(to right, #26A69A, #0284C7)',
          '-webkit-background-clip': 'text',
          'color': 'transparent',
        },
        '.bg-brand-gradient': {
          background: 'linear-gradient(to right, #26A69A, #0284C7)',
        },
        '.bg-hero-gradient': {
          background: 'linear-gradient(to bottom right, #E9F5F4, #ffffff)',
        },
        '.bg-cta-gradient': {
          background: 'linear-gradient(to right, #26A69A, #0284C7)',
        },
        '.bg-teal-gradient': {
          background: 'linear-gradient(90deg, #0BA3C7 0%, #12866C 100%)',
        },
        '.text-readable': {
          fontSize: '1rem',
          lineHeight: '1.45',
          maxWidth: '58ch',
        },
        '.text-readable-tablet': {
          fontSize: '0.94rem',
          lineHeight: '1.5',
        },
        '.text-readable-mobile': {
          fontSize: '0.88rem',
          lineHeight: '1.45',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}