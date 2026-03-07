---
description: Public-facing layout rhythm and heading system for Doctor.mx funnel pages
---

# Public UI spacing reference

## Approved section padding

- `.public-section`
  - `py-20 sm:py-24`
- `.public-section-compact`
  - `py-16 sm:py-20`

Use `.public-section` for major marketing blocks and `.public-section-compact` for tighter supporting sections.

## Approved heading composition

Use `PublicSectionHeading` for public funnel sections.

### Light theme
- dark headline
- blue accent line
- muted gray description

### Dark theme
- white headline
- light-blue accent line
- high-contrast light description

## Approved content rhythm

- heading wrapper: `.public-heading-stack`
- multi-column / card groups: `.public-content-gap`
- standard panels/cards: `.public-panel`

## Dark panel exceptions

Dark rails or dark CTA panels should avoid low-contrast glassmorphism when body copy is primary content.

Use:
- more opaque tinted surfaces
- stronger border separation
- brighter body copy
- stable padding (`p-6` or `p-8`)

Avoid stacking multiple translucent blur-heavy layers for core reading surfaces.
