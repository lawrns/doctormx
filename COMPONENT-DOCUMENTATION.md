# Doctor.mx UI Component Documentation

This document provides information about the UI components used in the Doctor.mx application.

## Table of Contents

1. [Basic Components](#basic-components)
   - [Button](#button)
   - [Input](#input)
   - [Select](#select)
   - [Checkbox](#checkbox)
2. [Layout Components](#layout-components)
   - [Modal](#modal)
   - [Breadcrumbs](#breadcrumbs)
3. [Feedback Components](#feedback-components)
   - [Toast](#toast)
   - [SkeletonLoader](#skeletonloader)
4. [Page Components](#page-components)
   - [EnhancedNavbar](#enhancednavbar)
   - [SearchMap](#searchmap)

## Basic Components

### Button

The Button component provides a standardized way to create buttons throughout the application.

**Usage:**
```jsx
import { Button } from './components/ui';

// Primary button
<Button 
  variant="primary" 
  onClick={handleClick}
>
  Click Me
</Button>

// Link styled as button
<Button 
  as="link" 
  to="/some-path" 
  variant="outline"
>
  Go to Page
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'text' | 'danger'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `fullWidth`: boolean
- `disabled`: boolean
- `icon`: React.ReactNode
- `iconPosition`: 'left' | 'right'
- `as`: 'button' | 'link'
- `to`: string (required when as="link")

### Input

The Input component provides a standardized way to create form inputs.

**Usage:**
```jsx
import { Input } from './components/ui';

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<Mail size={18} />}
  required
/>
```

**Props:**
- `label`: string
- `helperText`: string
- `error`: string
- `leftIcon`: React.ReactNode
- `rightIcon`: React.ReactNode
- `fullWidth`: boolean
- All standard input props (type, value, onChange, etc.)

### Select

The Select component provides a standardized dropdown selector.

**Usage:**
```jsx
import { Select } from './components/ui';

<Select
  label="Country"
  options={[
    { value: 'mx', label: 'Mexico' },
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ]}
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  error={errors.country}
/>
```

**Props:**
- `options`: Array of { value: string, label: string, disabled?: boolean }
- `label`: string
- `helperText`: string
- `error`: string
- `fullWidth`: boolean
- All standard select props (value, onChange, etc.)

### Checkbox

The Checkbox component provides a standardized checkbox input.

**Usage:**
```jsx
import { Checkbox } from './components/ui';

<Checkbox
  label="I agree to the terms and conditions"
  checked={agreed}
  onChange={(e) => setAgreed(e.target.checked)}
  error={errors.agreed}
/>
```

**Props:**
- `label`: string | React.ReactNode
- `helperText`: string
- `error`: string
- All standard checkbox props (checked, onChange, etc.)

## Layout Components

### Modal

The Modal component provides a standardized way to create modals.

**Usage:**
```jsx
import { Modal } from './components/modal';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content goes here</p>
  <button onClick={() => setIsOpen(false)}>Close</button>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `children`: React.ReactNode

### Breadcrumbs

The Breadcrumbs component provides navigation breadcrumbs.

**Usage:**
```jsx
import Breadcrumbs from './components/Breadcrumbs';

<Breadcrumbs 
  customPaths={{
    "doctor": "Perfil de Médico",
    [id]: doctor.name
  }}
/>
```

**Props:**
- `customPaths`: Record<string, string>
- `className`: string

## Feedback Components

### Toast

The Toast component provides a standardized way to show notifications.

**Usage:**
```jsx
import { useToast } from './contexts/ToastContext';

const { addToast } = useToast();

// Show a success toast
addToast('Operation successful!', 'success');

// Show an error toast
addToast('Something went wrong', 'error', 5000);
```

**Toast Provider Props:**
- `children`: React.ReactNode

**Toast Component Props:**
- `message`: string
- `type`: 'success' | 'error' | 'info' | 'warning'
- `duration`: number (in ms)
- `onClose`: () => void
- `position`: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

### SkeletonLoader

The SkeletonLoader component provides loading placeholders.

**Usage:**
```jsx
import { SkeletonLoader } from './components/ui';

// Simple text skeleton
<SkeletonLoader type="text" count={3} />

// Circle skeleton
<SkeletonLoader type="circle" width={40} height={40} />

// Doctor card skeleton
<SkeletonLoader type="doctor-card" />
```

**Props:**
- `type`: 'text' | 'circle' | 'rectangle' | 'avatar' | 'card' | 'button' | 'input' | 'doctor-card'
- `width`: string | number
- `height`: string | number
- `circle`: boolean
- `count`: number
- `className`: string

## Page Components

### EnhancedNavbar

The EnhancedNavbar component provides the main navigation for the application.

**Key Features:**
- Active section highlighting
- Dropdown menus for categories
- Mobile responsive with hamburger menu
- User authentication status awareness

### SearchMap

The SearchMap component provides a map view for doctor search results.

**Usage:**
```jsx
import SearchMap from './components/search/SearchMap';

<SearchMap
  doctors={filteredDoctors}
  selectedDoctor={selectedDoctor}
  onDoctorSelect={handleDoctorSelect}
/>
```

**Props:**
- `doctors`: Array of doctor objects
- `selectedDoctor`: string | null (doctor ID)
- `onDoctorSelect`: (doctorId: string) => void
- `onClose`: () => void (optional, for mobile view)