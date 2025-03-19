# Navigation Components

This directory contains the enhanced navigation components for Doctor.mx platform.

## Components

### EnhancedNavbar

A modern, responsive navbar component with the following features:

- Dropdown menus for main navigation categories
- Mobile-responsive design with hamburger menu
- Support for language switching (Spanish/English)
- Authentication state integration
- Doctor IA promotion feature
- Interactive hover and focus states

## Usage

Import the EnhancedNavbar component from this directory:

```jsx
import { EnhancedNavbar } from './components/Navigation';

function App() {
  return (
    <div className="app">
      <EnhancedNavbar />
      {/* Other components */}
    </div>
  );
}
```

## Features

1. **Dropdown Menus:** Hover-based dropdown menus for desktop and click-based for mobile
2. **Authentication:** Conditionally renders login/register or user account options
3. **Doctor IA Promotion:** Highlight the AI doctor feature with a special button
4. **Language Selector:** Toggle between Spanish and English interfaces
5. **Accessibility:** Proper ARIA attributes and keyboard navigation support
6. **Responsive Design:** Adapts to different screen sizes

## Dependencies

- React Router for navigation
- Lucide React for icons
- Tailwind CSS for styling
- AuthContext for authentication state

## Testing

Basic unit tests are included in the `__tests__` directory. Run tests with:

```bash
npm test -- --watch src/components/Navigation
```
