# Mobile Menu Implementation

## Summary
Implemented a fully functional mobile navigation menu for the Header component.

## Changes Made

### File: `src/components/layout/Header.tsx`

#### 1. Added Sheet Component Imports
```typescript
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
```

#### 2. Added State Management
```typescript
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
```

#### 3. Created Navigation Links Array
```typescript
const navLinks = [
  { href: '/doctores', label: 'Buscar doctores' },
  { href: '/app/second-opinion', label: 'Consulta IA' },
  { href: '/specialties', label: 'Especialidades' },
  { href: '/for-doctors', label: 'Para doctores' },
]
```

#### 4. Implemented Mobile Menu Button
Replaced the static button with a functional Sheet trigger:

```typescript
<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
  <SheetTrigger asChild>
    <button 
      className="md:hidden p-2 text-gray-600 hover:text-gray-900"
      aria-label="Abrir menú"
    >
      <Menu className="w-6 h-6" />
    </button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[300px] sm:w-[350px]">
    {/* Menu content */}
  </SheetContent>
</Sheet>
```

#### 5. Mobile Menu Content Structure
- **Header:** Logo and title
- **Navigation:** All main nav links with SheetClose wrapper
- **Auth Buttons:** Login and Register buttons (when showAuth is true)

## Features

### Functionality
- ✅ Opens/closes on menu button click
- ✅ Closes when clicking a navigation link
- ✅ Closes when clicking outside the menu
- ✅ Closes when clicking the X button
- ✅ State management with React useState

### Design
- **Position:** Right-side sheet (slides in from right)
- **Width:** 300px on mobile, 350px on small tablets
- **Animation:** Smooth slide-in/slide-out with Sheet component
- **Backdrop:** Semi-transparent overlay

### Accessibility
- ✅ `aria-label="Abrir menú"` on trigger button
- ✅ SheetClose wrapper around all navigation links
- ✅ Proper focus management
- ✅ Keyboard navigation support

### Responsive Behavior
| Viewport | Navigation | Mobile Menu |
|----------|------------|-------------|
| Desktop (≥768px) | Horizontal nav visible | Hidden |
| Mobile (<768px) | Hidden | Menu button visible |

## Navigation Links Included
1. **Buscar doctores** → `/doctores`
2. **Consulta IA** → `/app/second-opinion`
3. **Especialidades** → `/specialties`
4. **Para doctores** → `/for-doctors`

## Auth Integration
When `showAuth` prop is true:
- **Iniciar sesión** button → `/auth/login`
- **Registrarse** button → `/auth/register`

Both buttons use outline style for login and primary style for register.

## Testing Checklist
- [x] Menu button visible on mobile (<768px)
- [x] Menu button hidden on desktop (≥768px)
- [x] Menu opens on button click
- [x] Menu closes on link click
- [x] Menu closes on backdrop click
- [x] Menu closes on X button click
- [x] All navigation links work correctly
- [x] Auth buttons work correctly (when showAuth=true)
- [x] Smooth animations work
- [x] No console errors

## Browser Compatibility
- Uses Radix UI Sheet primitive (accessible, cross-browser)
- CSS transitions for animations
- Mobile-first responsive design
