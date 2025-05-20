# DoctorMX Brand Colors Guide

This guide explains how to use the updated brand color palette in the DoctorMX application. The color system has been implemented in Tailwind CSS and provides consistent tokens for use across the application.

## Brand Color Palette

Our brand colors have been organized into the following palette:

### Primary - Jade
- `brand-jade-500` (#26A69A) - Primary brand color for buttons, active states, and key UI elements
- `brand-jade-50` (#E9F5F4) - Light jade for hero gradient start and subtle backgrounds

### Secondary - Sun
- `brand-sun-500` (#FFB300) - Secondary CTAs, highlights, and accent elements

### Accents - Sky
- `brand-sky-600` (#0284C7) - Links, icon highlights, and interactive elements

### Text and Backgrounds
- `brand-charcoal` (#263238) - Base text color
- `brand-night` (#0D1A24) - Dark theme background

## Usage in Code

### Direct Color References

You can use the brand colors directly in your Tailwind classes:

```jsx
// Using primary brand color
<button className="bg-brand-jade-500 text-white">Submit</button>

// Using secondary brand color
<div className="bg-brand-sun-500 text-brand-charcoal">Notification</div>

// Using accent color for links
<a className="text-brand-sky-600 hover:text-brand-sky-700">Learn more</a>

// Light backgrounds
<section className="bg-brand-jade-50 p-6">Hero content</section>

// Dark mode
<div className="bg-brand-night text-white">Dark mode content</div>
```

### Utility Classes

For convenience, we've also created utility classes for common use cases:

```jsx
// Brand text colors
<p className="text-brand-primary">Primary text</p>
<p className="text-brand-secondary">Secondary text</p>
<p className="text-brand-highlight">Highlight text</p>
<p className="text-brand-base">Base text</p>

// Brand backgrounds
<div className="bg-brand-primary">Primary background</div>
<div className="bg-brand-secondary">Secondary background</div>
<div className="bg-brand-light">Light background</div>
<div className="bg-brand-dark">Dark background</div>

// Brand gradients
<div className="bg-brand-gradient-primary">Primary gradient</div>
<div className="bg-brand-gradient-hero">Hero gradient</div>

// Brand buttons
<button className="btn-brand-primary">Primary Button</button>
<button className="btn-brand-secondary">Secondary Button</button>
<button className="btn-brand-outline">Outline Button</button>
```

## Typography

The typography system uses:
- **Poppins** for display text (headings, features)
- **Inter** for body text

Usage:

```jsx
// Using Poppins for display
<h1 className="font-display text-3xl">Heading</h1>

// Using Inter for body text
<p className="font-body">Body text</p>
```

## Responsive Breakpoints

The system includes these responsive breakpoints:

- `xs`: 480px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

Example:

```jsx
<div className="bg-brand-jade-50 md:bg-brand-jade-100 lg:bg-brand-jade-200">
  This background changes color at different breakpoints
</div>
```

## Dark Mode

Dark mode is supported using the `dark:` prefix:

```jsx
<div className="bg-white dark:bg-brand-night text-brand-charcoal dark:text-white">
  This element adapts to dark mode
</div>
```

## Animations

The application includes animation utilities that can be combined with brand colors:

```jsx
<div className="bg-brand-jade-500 animate-fade-in">
  Fades in with primary color
</div>

<button className="btn-brand-primary animate-slide-up">
  Primary button that slides up
</button>
```

## Legacy Colors

For backward compatibility, the previous color system (`primary-blue`, etc.) is still available but should be migrated to the new brand colors in new development.