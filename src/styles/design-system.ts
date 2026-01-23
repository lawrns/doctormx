/**
 * DoctorMX Unified Design System
 * Single source of truth for colors, typography, spacing, and other design tokens
 */

// Color System - Mexican Healthcare Theme
export const colors = {
  // Primary Brand Colors (Medical Teal)
  primary: {
    50: '#E9F5F4',
    100: '#D4EBE9', 
    200: '#A9D7D3',
    300: '#7EC3BD',
    400: '#53AFA7',
    500: '#26A69A', // Main brand color
    600: '#1F8A80',
    700: '#196E66',
    800: '#12534D',
    900: '#0A3733',
    DEFAULT: '#26A69A'
  },
  
  // Secondary Colors (Healthcare Sky Blue)
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7', // Links and highlights
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    DEFAULT: '#0284C7'
  },
  
  // Accent Colors (Warm Medical Orange)
  accent: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFB300', // CTAs and actions
    600: '#FFA000',
    700: '#FF8F00',
    800: '#FF6F00',
    900: '#FF5722',
    DEFAULT: '#FFB300'
  },
  
  // Neutral Colors (Medical Grays)
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
    DEFAULT: '#737373'
  },
  
  // Mexican Cultural Accents (Subtle)
  mexico: {
    green: '#006341',
    red: '#CE1126',
    gold: '#FFD700'
  },
  
  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B', 
    error: '#EF4444',
    info: '#3B82F6',
    
    // Medical Specific
    emergency: '#DC2626',
    prescription: '#7C3AED',
    appointment: '#059669',
    consultation: '#0284C7'
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    medical: '#F8FAFC', // Subtle medical blue-gray
    warm: '#FFFBF7' // Warm white for comfort
  },
  
  // Text Colors
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#A3A3A3',
    inverse: '#FFFFFF',
    medical: '#0C4A6E', // Medical blue for headings
    brand: '#26A69A'
  },
  
  // Border Colors
  border: {
    light: '#E5E5E5',
    medium: '#D4D4D4',
    dark: '#A3A3A3',
    focus: '#0284C7',
    error: '#EF4444',
    success: '#10B981'
  }
};

// Typography System
export const typography = {
  fontFamily: {
    // Mexican-friendly, medical-appropriate fonts
    sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    heading: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }]       // 60px
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  
  // Semantic Text Styles
  textStyles: {
    // Headings
    h1: {
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '1.2',
      fontFamily: 'Poppins',
      letterSpacing: '-0.025em',
      color: colors.text.medical
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: '700', 
      lineHeight: '1.25',
      fontFamily: 'Poppins',
      letterSpacing: '-0.025em',
      color: colors.text.medical
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.3',
      fontFamily: 'Poppins',
      color: colors.text.medical
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      fontFamily: 'Poppins',
      color: colors.text.primary
    },
    
    // Body Text
    body: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.6',
      fontFamily: 'Inter',
      color: colors.text.primary
    },
    bodyLarge: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.6',
      fontFamily: 'Inter',
      color: colors.text.primary
    },
    bodySmall: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
      fontFamily: 'Inter',
      color: colors.text.secondary
    },
    
    // UI Elements
    button: {
      fontSize: '0.875rem',
      fontWeight: '600',
      lineHeight: '1.5',
      fontFamily: 'Poppins',
      letterSpacing: '0.025em'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.5',
      fontFamily: 'Inter',
      color: colors.text.primary
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.5',
      fontFamily: 'Inter',
      color: colors.text.tertiary
    }
  }
};

// Spacing System (8px base grid)
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
};

// Shadow System
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  
  // Medical-specific shadows
  card: '0 4px 6px -1px rgba(38, 166, 154, 0.1), 0 2px 4px -1px rgba(38, 166, 154, 0.06)',
  cardHover: '0 10px 15px -3px rgba(38, 166, 154, 0.15), 0 4px 6px -2px rgba(38, 166, 154, 0.1)',
  brand: '0 4px 14px 0 rgba(38, 166, 154, 0.2)',
  brandHover: '0 6px 20px 0 rgba(38, 166, 154, 0.3)'
};

// Animation System
export const animations = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  
  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    medical: 'cubic-bezier(0.4, 0, 0.2, 1)' // Smooth medical transitions
  },
  
  // Keyframes
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    slideUp: {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' }
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' }
    },
    heartbeat: {
      '0%': { transform: 'scale(1)' },
      '14%': { transform: 'scale(1.05)' },
      '28%': { transform: 'scale(1)' },
      '42%': { transform: 'scale(1.05)' },
      '70%': { transform: 'scale(1)' }
    }
  }
};

// Breakpoints (Mobile-first)
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px', 
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Component Tokens
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px'
    },
    padding: {
      sm: '0 12px',
      md: '0 16px', 
      lg: '0 24px'
    },
    minWidth: '44px' // Accessibility touch target
  },
  
  input: {
    height: '44px', // Accessibility touch target
    padding: '0 12px',
    borderRadius: '8px'
  },
  
  card: {
    padding: '24px',
    borderRadius: '12px'
  }
};

export default {
  colors,
  typography,
  spacing,
  shadows,
  animations,
  breakpoints,
  components
};