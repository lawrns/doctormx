# Keyboard Navigation Test Guide

## Quick Manual Testing Procedure

### 1. Tab Navigation Test (2 minutes)

1. Open the application homepage
2. Press `Tab` key repeatedly
3. **Expected:** Focus moves through all interactive elements in logical order
4. **Verify:** No elements are skipped, no keyboard traps

### 2. Skip Link Test (1 minute)

1. Load any page
2. Press `Tab` once (before any other interaction)
3. **Expected:** "Saltar al contenido principal" link appears
4. Press `Enter`
5. **Expected:** Focus jumps to main content area

### 3. Button Activation Test (1 minute)

1. Navigate to any button using `Tab`
2. Press `Enter`
3. **Expected:** Button activates
4. Navigate to another button
5. Press `Space`
6. **Expected:** Button activates

### 4. Form Navigation Test (2 minutes)

1. Navigate to `/auth/login`
2. Press `Tab` to move through form fields
3. **Expected:** Each field receives focus in order
4. Type in each field
5. **Expected:** Input is accepted

### 5. Dropdown Test (2 minutes)

1. Find a dropdown menu (e.g., user menu)
2. Press `Enter` to open
3. Use `ArrowDown`/`ArrowUp` to navigate items
4. Press `Enter` to select
5. **Expected:** Item is selected, dropdown closes

### 6. Modal Dialog Test (2 minutes)

1. Open any modal dialog
2. Press `Tab` multiple times
3. **Expected:** Focus stays trapped within modal
4. Press `Escape`
5. **Expected:** Modal closes, focus returns to trigger

## Keyboard Shortcuts Reference

| Action | Keys |
|--------|------|
| Next element | `Tab` |
| Previous element | `Shift + Tab` |
| Activate button/link | `Enter` or `Space` |
| Close modal/dropdown | `Escape` |
| Navigate dropdown items | `ArrowUp` / `ArrowDown` |
| Navigate tabs | `ArrowLeft` / `ArrowRight` |
| First item in list | `Home` |
| Last item in list | `End` |
| Select radio/checkbox | `Space` |

## Common Issues to Check

### ❌ Issue: Element Not Focusable
**Fix:** Add `tabIndex={0}` or use native HTML element

### ❌ Issue: No Focus Indicator
**Fix:** Add CSS: `:focus-visible { outline: 2px solid blue; }`

### ❌ Issue: Custom Element Not Activating
**Fix:** Add keyboard handler:
```tsx
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleActivate();
  }
}}
```

### ❌ Issue: Focus Trap Not Working
**Fix:** Use `useFocusTrap` hook from `@/components/ui/accessibility/focus-trap`

## Automated Testing

Run keyboard navigation tests:
```bash
npm run test:a11y:keyboard
```

## Sign-off Checklist

- [ ] Tab navigation works on all pages
- [ ] Skip link functional
- [ ] All buttons keyboard accessible
- [ ] All forms keyboard accessible
- [ ] Dropdowns work with keyboard
- [ ] Modals trap focus
- [ ] Focus indicators visible
- [ ] No keyboard traps

**Tester:** _________________ **Date:** _________________
