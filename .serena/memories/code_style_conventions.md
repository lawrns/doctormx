# DoctorMX Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled with all strict checks
- **No Unused Locals/Parameters**: Enforced
- **No Fallthrough Cases**: Enforced in switch statements
- **Module Resolution**: Bundler mode with path aliases
- **Target**: ES2020

## Component Patterns
- **Functional Components**: Using React.FC with TypeScript
- **Props Interface**: Named exports with `Props` suffix (e.g., `ButtonProps`)
- **Default Props**: Destructured with defaults in function parameters
- **File Naming**: PascalCase for components (e.g., `Button.tsx`)

## Styling Approach
- **Tailwind CSS**: Primary styling method with utility classes
- **Custom CSS**: Modular CSS files for specific fixes
- **Design Tokens**: Brand colors system (brand-jade, brand-sun, brand-sky, etc.)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Animation**: Framer Motion for complex animations

## File Organization
```
/src
  /components     # Reusable UI components
  /contexts       # React Context providers
  /features       # Feature-specific components and logic
  /lib           # Helper libraries and utilities
  /pages         # Route pages
  /services      # Business logic and API services
  /utils         # Utility functions
  /hooks         # Custom React hooks
  /styles        # Global styles and design system
```

## Import Organization
1. React and core libraries
2. Third-party libraries
3. Internal components
4. Services and utilities
5. Styles and assets
6. Type imports

## State Management Patterns
- **Context API**: For global app state (Auth, Theme, etc.)
- **React Query**: For server state and API calls
- **XState**: For complex state machines (questionnaires)
- **Local State**: useState for component-specific state

## Error Handling
- Error boundaries for component trees
- Try-catch blocks in async functions
- User-friendly error messages
- Console logging for debugging

## Security Practices
- Environment variables for sensitive data
- Encryption service for sensitive information
- No hardcoded secrets or API keys
- DOMPurify for HTML sanitization

## Mexican Market Considerations
- Spanish language as primary
- Cultural context in AI responses
- Mexican healthcare compliance
- Local timezone and date formats