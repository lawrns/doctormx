# Accessibility Components - Doctor.mx

This directory contains WCAG 2.1 AA compliant accessibility components and hooks for the Doctor.mx application.

## Focus Management

### useFocusTrap Hook

Traps keyboard focus within a container (typically a modal or dialog).

```tsx
import { useFocusTrap } from '@/components/ui/accessibility'

function MyModal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null)
  
  useFocusTrap({
    containerRef: modalRef,
    isActive: isOpen,
    onEscape: onClose,
  })
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  )
}
```

### FocusTrap Component

Component wrapper that traps focus automatically.

```tsx
import { FocusTrap } from '@/components/ui/accessibility'

<FocusTrap isActive={isOpen} onEscape={handleClose}>
  <div role="dialog">
    {/* Content */}
  </div>
</FocusTrap>
```

### SkipLink Component

Allows keyboard users to skip to main content.

```tsx
import { SkipLink, MainContent } from '@/components/ui/accessibility'

// In your layout:
<SkipLink targetId="main-content" />
<MainContent id="main-content">
  {/* Page content */}
</MainContent>
```

## Live Regions

### LiveRegion Component

Announces dynamic content changes to screen readers.

```tsx
import { LiveRegion } from '@/components/ui/accessibility'

// Status announcement (polite)
<LiveRegion message={statusMessage} role="status" />

// Alert announcement (assertive)
<LiveRegion message={errorMessage} role="alert" />
```

## Focus Indicators

All interactive elements in the design system have visible focus indicators:

- **Buttons**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Inputs**: `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring`
- **Links**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Checkboxes/Radio**: `focus-visible:ring-[3px] focus-visible:ring-ring/50`
- **Select/ComboBox**: `focus-visible:ring-[3px] focus-visible:ring-ring/50`
- **Tabs**: `focus-visible:ring-[3px] focus-visible:ring-ring/50`

## Global CSS Focus Styles

The `globals.css` includes global focus-visible styles as a fallback:

```css
a:focus-visible,
button:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: none;
  ring: 3px;
  ring-color: hsl(var(--ring) / 0.5);
  ring-offset: 2px;
}
```

## Dialog/Modal Focus Management

All dialogs and modals implement:

1. **Focus Trapping**: Focus is trapped within the modal when open
2. **Initial Focus**: First focusable element is focused on open
3. **Focus Return**: Focus returns to trigger element when closed
4. **Escape Key**: Pressing Escape closes the modal

### Dialog Component Usage

```tsx
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Content automatically has focus trapped */}
  </DialogContent>
</Dialog>
```

### Sheet Component Usage

```tsx
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    {/* Content automatically has focus trapped */}
  </SheetContent>
</Sheet>
```

## WCAG 2.1 Compliance

### Level A Requirements

- **1.3.1 Info and Relationships**: Semantic HTML and ARIA attributes
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap**: Users can navigate away from any element
- **2.4.1 Bypass Blocks**: Skip links for repetitive content
- **2.4.3 Focus Order**: Logical focus order
- **2.4.4 Link Purpose**: Link text describes destination
- **3.3.1 Error Identification**: Errors clearly identified
- **3.3.2 Labels or Instructions**: Form fields have labels
- **4.1.1 Parsing**: Valid HTML markup
- **4.1.2 Name, Role, Value**: Custom components have proper ARIA

### Level AA Requirements

- **1.4.3 Contrast**: Minimum 4.5:1 contrast ratio for text
- **1.4.4 Resize Text**: Text can be resized up to 200%
- **1.4.5 Images of Text**: Text used instead of images
- **2.4.5 Multiple Ways**: Multiple ways to find pages
- **2.4.6 Headings and Labels**: Descriptive headings and labels
- **2.4.7 Focus Visible**: Focus indicator is visible
- **3.1.2 Language of Parts**: Language of content identified
- **3.2.3 Consistent Navigation**: Navigation consistent across pages
- **3.2.4 Consistent Identification**: Components identified consistently
- **3.3.3 Error Suggestion**: Suggestions for error correction
- **3.3.4 Error Prevention**: Reversible submissions
- **4.1.3 Status Messages**: Status messages announced

## Testing Focus Management

### Keyboard Navigation Test

1. Press Tab to navigate through all interactive elements
2. Verify focus indicator is visible on all elements
3. Press Shift+Tab to navigate backwards
4. Verify Enter/Space activates buttons and links
5. Verify Escape closes modals/dropdowns

### Screen Reader Test

1. Enable screen reader (NVDA, JAWS, VoiceOver)
2. Navigate with Tab and arrow keys
3. Verify all elements are announced properly
4. Verify live regions announce status updates
5. Verify form labels are associated with inputs

### Focus Trap Test

1. Open a modal/dialog
2. Press Tab repeatedly
3. Verify focus stays within the modal
4. Press Shift+Tab
5. Verify focus cycles backwards within modal
6. Close modal
7. Verify focus returns to trigger element

## Browser Support

Focus management is supported in:

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
