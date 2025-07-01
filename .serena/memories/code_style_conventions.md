# DoctorMX - Code Style & Conventions

## TypeScript Configuration
- **Strict mode enabled** with all strict type checking options
- **ES2020 target** with DOM and DOM.Iterable libraries
- **Path mapping** configured: @/* for src/*, @pkg/* for packages/*, @svc/* for services/*
- **JSX**: react-jsx transform
- **Module resolution**: bundler mode

## Code Style Standards
- **ESLint** configuration with TypeScript support
- **React Hooks** linting rules enforced
- **React Refresh** plugin for development
- **No unused locals or parameters** enforced
- **No fallthrough cases** in switch statements

## Component Patterns
- Functional components with TypeScript interfaces
- Custom hooks pattern for reusable logic
- Context providers for state management
- Component composition over inheritance

## File Structure Conventions
- Components in `src/components/` with TypeScript
- Features organized in `src/features/` by domain
- Shared utilities in `src/utils/`
- Type definitions in dedicated `.d.ts` files
- Barrel exports using `index.ts` files

## Styling Conventions
- **Tailwind CSS** utility-first approach
- Custom design tokens for brand colors
- Responsive design patterns with mobile-first
- Component-level CSS modules when needed
- Custom utility classes for brand gradients

## Naming Conventions
- **PascalCase** for components and interfaces
- **camelCase** for functions and variables
- **kebab-case** for file names and CSS classes
- **SCREAMING_SNAKE_CASE** for constants
- Descriptive component and prop names

## Import/Export Patterns
- Default exports for main components
- Named exports for utilities and types
- Barrel exports for component collections
- Relative imports for local files
- Absolute imports using path mapping

## Healthcare Compliance
- Mexican healthcare regulation compliance
- Cultural sensitivity in AI responses
- Privacy and data protection considerations
- Medical terminology accuracy