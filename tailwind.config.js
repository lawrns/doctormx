/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Extended color palette
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        'primary-blue': '#2962FF',
        'primary-blue-light': '#5B86FF',
        'primary-blue-dark': '#1641B5',
        // Dark mode specific colors
        dark: {
          bg: '#121212',
          card: '#1e1e1e',
          border: '#2e2e2e',
          text: '#e0e0e0',
          muted: '#a0a0a0'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-right': 'slideRight 0.3s ease-in-out',
        'slide-left': 'slideLeft 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Add animation utilities plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.animate-in': {
          animationFillMode: 'both',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.fade-in': {
          animationName: 'fadeIn',
        },
        '.fade-in-50': {
          animationName: 'fadeIn',
          animationDuration: '0.5s',
        },
        '.slide-in-from-top': {
          animationName: 'slideUp',
          transform: 'translateY(-10px)',
        },
        '.slide-in-from-bottom': {
          animationName: 'slideUp',
          transform: 'translateY(10px)',
        },
        '.slide-in-from-left': {
          animationName: 'slideRight',
          transform: 'translateX(-10px)',
        },
        '.slide-in-from-right': {
          animationName: 'slideLeft',
          transform: 'translateX(10px)',
        },
        '.scale-in-95': {
          animationName: 'scaleIn',
          transform: 'scale(0.95)',
        },
        '.duration-300': {
          animationDuration: '300ms',
        },
        '.duration-500': {
          animationDuration: '500ms',
        },
        '.duration-700': {
          animationDuration: '700ms',
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};
