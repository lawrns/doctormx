import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      colors: {
        // CSS Variable-based colors (shadcn/ui pattern)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // ── Doctor.mx Design System ──
        cobalt: {
          50: '#eff7ff',
          100: '#dceeff',
          200: '#badcff',
          300: '#8fc4ff',
          400: '#54a6f5',
          500: '#2688e6',
          600: '#0d72d6',
          700: '#0b5fb8',
          800: '#0b3f78',
          900: '#071f3f',
        },
        ink: {
          DEFAULT: 'hsl(var(--brand-ink))',
          soft: 'hsl(var(--brand-ink) / 0.85)',
        },
        vital: {
          DEFAULT: '#0d72d6',
          soft: '#e8f3ff',
        },
        coral: {
          DEFAULT: '#ff5a3d',
          soft: '#ffe4dc',
        },
        amber: {
          DEFAULT: '#f4a736',
        },
        // Semantic text colors (legacy mapped to new)
        'text-primary': 'hsl(var(--text-primary))',
        'text-secondary': 'hsl(var(--text-secondary))',
        'text-muted': 'hsl(var(--text-muted))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      boxShadow: {
        'dx-1': 'var(--card-shadow)',
        'dx-2': 'var(--card-shadow-hover)',
        'card': 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
        'panel': 'var(--public-shadow-medium)',
      },
      spacing: {
        'card-compact': 'var(--card-padding-compact)',
        'card': 'var(--card-padding-default)',
        'card-comfortable': 'var(--card-padding-comfortable)',
        'card-hero': 'var(--card-padding-hero)',
        'card-gap': 'var(--card-gap)',
      },
      transitionTimingFunction: {
        'dx': 'cubic-bezier(.2,.7,.2,1)',
      },
    },
  },
  plugins: [],
}
export default config
