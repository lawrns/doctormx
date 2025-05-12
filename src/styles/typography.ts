export const typography = {
  fontFamily: {
    sans: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    heading: "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
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
    black: '900',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  
  textStyles: {
    h1: {
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '1.2',
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: '700',
      lineHeight: '1.25',
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.3',
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: '-0.025em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      fontFamily: "'Montserrat', sans-serif",
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: '600',
      lineHeight: '1.4',
      fontFamily: "'Montserrat', sans-serif",
    },
    h6: {
      fontSize: '1rem',
      fontWeight: '600',
      lineHeight: '1.5',
      fontFamily: "'Montserrat', sans-serif",
    },
    
    bodyLarge: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.6',
      fontFamily: "'Nunito', sans-serif",
    },
    bodyDefault: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.6',
      fontFamily: "'Nunito', sans-serif",
    },
    bodySmall: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
      fontFamily: "'Nunito', sans-serif",
    },
    
    caption: {
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.5',
      fontFamily: "'Nunito', sans-serif",
      letterSpacing: '0.025em',
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: '600',
      lineHeight: '1.5',
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: '0.025em',
      textTransform: 'uppercase',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.5',
      fontFamily: "'Nunito', sans-serif",
    },
  },
  
  responsive: {
    h1: {
      mobile: '1.875rem',
      tablet: '2.25rem',
      desktop: '2.5rem',
    },
    h2: {
      mobile: '1.5rem',
      tablet: '1.875rem',
      desktop: '2rem',
    },
    h3: {
      mobile: '1.25rem',
      tablet: '1.5rem',
      desktop: '1.75rem',
    },
    body: {
      mobile: '0.875rem',
      tablet: '1rem',
      desktop: '1.125rem',
    },
  }
};
