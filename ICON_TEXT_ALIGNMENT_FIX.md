# Site-Wide Icon + Text Alignment Fix

## Problem
Icons and text were sometimes appearing stacked vertically (icon on top, text below) instead of horizontally aligned (icon + text on same line).

## Root Cause
- Default CSS display properties (block vs inline-flex)
- Inconsistent flex alignment across components
- Missing universal styling for icon-text combinations

## Solution Implemented

### 1. Global CSS Fix (`src/index.css`)
Added universal CSS rules to ensure all icons and text are properly aligned:

```css
/* Universal Icon + Text Alignment Fix */
.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  vertical-align: middle;
}

.icon-text svg,
.icon-text i,
.icon-text img {
  display: inline-block;
  flex-shrink: 0;
}

/* Ensure buttons with children (icon + text) use inline-flex */
button > svg,
button > img,
a > svg,
a > img {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
```

### 2. Tailwind Plugin (`tailwind.config.js`)
Added custom Tailwind component for reusable `.icon-text` utility:

```javascript
plugins: [
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
```

## Usage

### Option 1: Using the `.icon-text` Class
```jsx
<button className="icon-text px-4 py-2 bg-blue-600 text-white rounded-lg">
  <Icon name="arrow-left" size="sm" />
  Volver al inicio de sesión
</button>

<div className="icon-text text-sm text-gray-600">
  <Icon name="check" size="sm" className="text-green-500" />
  <span>5 preguntas GRATIS</span>
</div>
```

### Option 2: Using Tailwind Utilities
```jsx
<button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
  <Icon name="arrow-path" size="sm" />
  Actualizar estado
</button>

<div className="flex items-center gap-2 text-sm text-gray-600">
  <Icon name="envelope" size="sm" />
  <span>Email de soporte</span>
</div>
```

## Benefits
✅ **Site-wide consistency** - All icon + text combinations now align horizontally  
✅ **Future-proof** - New components automatically inherit correct styling  
✅ **Reusable** - `.icon-text` class can be applied anywhere  
✅ **No breaking changes** - Existing components using `flex items-center` continue to work  
✅ **Flexible** - Works with SVG icons, icon fonts (i tags), and images  

## Affected Components
All components throughout the site that display icons with text now benefit from this fix:
- Buttons with icons
- Navigation links
- List items with icons
- Trust indicators
- Feature cards
- Stat boxes
- Contact information displays
- Timeline steps
- And more...

## Testing
The fix has been tested on:
- ✅ Homepage trust indicators ("5 preguntas GRATIS", "Segunda opinión médica", "NOM-004 compliant")
- ✅ Verification page buttons ("Volver al inicio de sesión", "Actualizar estado")
- ✅ Contact information sections (email, phone, hours icons)
- ✅ Timeline steps (check marks, clock icons, etc.)

All icon + text combinations now properly display on a single horizontal line with appropriate spacing.

