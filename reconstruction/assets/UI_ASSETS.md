# UI Assets - Reusable Design System

> **Status**: ✅ VERIFIED WORKING  
> **Extracted from**: `tailwind.config.ts`, `src/app/globals.css`, `src/components/Icons.tsx`

---

## 1. Color Palette

### Primary Colors (Medical Blue Theme)
```css
/* CSS Variables - HSL format for theming */
--primary: 217 91% 60%;        /* #3b82f6 - Medical Blue */
--primary-foreground: 0 0% 100%;

/* Primary Scale (direct hex values) */
primary-50:  #eff6ff
primary-100: #dbeafe
primary-200: #bfdbfe
primary-300: #93c5fd
primary-400: #60a5fa
primary-500: #3b82f6  /* Main brand color */
primary-600: #2563eb
primary-700: #1d4ed8
primary-800: #1e40af
primary-900: #1e3a8a
```

### Accent Colors (Teal)
```css
/* Accent Scale */
accent-50:  #f0fdfa
accent-100: #ccfbf1
accent-200: #99f6e4
accent-300: #5eead4
accent-400: #2dd4bf
accent-500: #14b8a6  /* Main accent */
accent-600: #0d9488
accent-700: #0f766e
accent-800: #115e59
accent-900: #134e4a
```

### Semantic Colors
```css
/* Background & Foreground */
--background: 0 0% 100%       /* White */
--foreground: 222 47% 11%     /* Near black */

/* Cards & Popovers */
--card: 0 0% 100%
--card-foreground: 222 47% 11%
--popover: 0 0% 100%
--popover-foreground: 222 47% 11%

/* Status Colors */
--destructive: 0 84% 60%      /* Red for errors */
--success: 142 76% 36%        /* Green for success */
--muted: 210 40% 96%
--muted-foreground: 215 16% 47%

/* Borders & Inputs */
--border: 214 32% 91%         /* Light gray */
--input: 214 32% 91%
--ring: 217 91% 60%           /* Focus ring */
```

### Chart Colors
```css
--chart-1: 217 91% 60%   /* Blue */
--chart-2: 160 60% 45%   /* Green */
--chart-3: 30 80% 55%    /* Orange */
--chart-4: 280 65% 60%   /* Purple */
--chart-5: 340 75% 55%   /* Pink */
```

### Dark Mode Colors
```css
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --card: 222 47% 11%;
  --card-foreground: 210 40% 98%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
}
```

---

## 2. Typography Scale

> Uses system font stack with Tailwind defaults

```css
/* Base settings */
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

### Text Colors
```css
--text-primary: 222 47% 11%     /* Main text */
--text-secondary: 215 16% 47%   /* Secondary/muted */
--text-muted: 215 14% 64%       /* Placeholder text */
```

### Gradient Text Utility
```css
.gradient-text {
  background: linear-gradient(135deg, #6366f1 0%, #00B4A3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 3. Border Radius

```css
--radius: 0.75rem;        /* Base: 12px */
lg: var(--radius)        /* 12px */
md: calc(var(--radius) - 2px)  /* 10px */
sm: calc(var(--radius) - 4px)  /* 8px */
```

---

## 4. Icon System

### Available Icons (from `src/components/Icons.tsx`)

```typescript
// Sistema de iconos - Simples y claros
const Icons = {
  Calendar,   // Appointment/scheduling
  Search,     // Search functionality
  User,       // User profile
  Clock,      // Time-related
  Money,      // Payments/pricing
  Star,       // Ratings/reviews
  Chart,      // Analytics/dashboards
  Settings,   // Configuration
  Users,      // Groups/patients list
}
```

### Icon Specifications
- **Size**: 24x24 viewBox
- **Stroke width**: 2
- **Style**: Outline (no fill)
- **Color**: Inherits `currentColor`

### Usage Pattern
```tsx
import { Icons } from '@/components/Icons'

<Icons.Calendar />
<Icons.Search className="w-5 h-5" />
```

---

## 5. Animation Utilities

### Fade Animations
```css
.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 300ms ease-out;
}
```

### Shimmer Loading Effect
```css
.skeleton-shimmer {
  background: linear-gradient(
    to right,
    #f4f1ed 0%,
    #e8e3db 50%,
    #f4f1ed 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### Pulse Ring (for AI/loading states)
```css
.animate-pulse-ring {
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(79, 70, 229, 0); }
}
```

### Staggered List Animations
```css
.stagger-animation > * {
  opacity: 0;
  animation: slideInBottom 300ms ease-out forwards;
}

.stagger-animation > *:nth-child(1) { animation-delay: 0ms; }
.stagger-animation > *:nth-child(2) { animation-delay: 50ms; }
.stagger-animation > *:nth-child(3) { animation-delay: 100ms; }
/* ... up to 6 items */
```

---

## 6. Glassmorphism Effects

```css
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-subtle {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Dark mode adjustments */
.dark .glass {
  background: rgba(15, 23, 42, 0.8);
}
```

---

## 7. Scrollbar Styling

```css
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f4f1ed;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: #e8e3db;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9b9085;
}

/* Hide scrollbar utility */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## 8. Images in /public

| File | Description | Status |
|------|-------------|--------|
| `/public/images/simeon.png` | Dr. Simeon mascot image (697KB) | ✅ KEEP |
| `/public/robots.txt` | SEO robots configuration | ✅ KEEP |
| `/public/file.svg` | Next.js placeholder | ⚠️ Can remove |
| `/public/globe.svg` | Next.js placeholder | ⚠️ Can remove |
| `/public/next.svg` | Next.js logo | ⚠️ Can remove |
| `/public/vercel.svg` | Vercel logo | ⚠️ Can remove |
| `/public/window.svg` | Next.js placeholder | ⚠️ Can remove |

---

## 9. Tailwind Configuration

```typescript
// tailwind.config.ts - Key extensions
{
  darkMode: 'class',
  theme: {
    extend: {
      colors: { /* See Color Palette above */ },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      }
    }
  }
}
```

---

## 10. Utility Functions

### Class Name Merging (`src/lib/utils/cn.ts`)
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage: cn('px-4 py-2', isActive && 'bg-blue-500', className)
```

---

## Summary: What to Keep

✅ **KEEP**:
- Complete color palette (primary blue + teal accent scales)
- CSS variable system for theming
- Animation utilities (fade, shimmer, pulse-ring, stagger)
- Glassmorphism effects
- Custom scrollbar styling
- Icon system (8 core icons)
- `cn()` utility function
- Dr. Simeon mascot image
- shadcn/ui compatible structure

❌ **LEAVE BEHIND**:
- Next.js placeholder SVGs
- Unused component styles
- Broken animation variants
