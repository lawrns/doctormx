# DoctorMX - Design Patterns & Guidelines

## Component Architecture Patterns

### 1. Feature-Based Organization
- Group related components, services, and types by feature domain
- Example: `features/ai-doctor/` contains all AI doctor related code
- Promotes modularity and maintainability

### 2. Compound Component Pattern
- UI components composed of smaller, focused components
- Example: Card components with CardHeader, CardContent, CardFooter
- Enables flexible and reusable UI compositions

### 3. Provider Pattern for State Management
- Context providers for global application state
- Example: AuthContext, ThemeContext, ConversationContext
- Centralized state management with TypeScript safety

## AI Integration Patterns

### 1. Service Layer Architecture
- Dedicated service classes for AI operations
- Example: AIService, BrainIntegrationService, ConversationIntelligence
- Separation of concerns between UI and AI logic

### 2. Response Processing Pipeline
- Structured approach to AI response handling
- Quality checks, cultural context, and medical accuracy validation
- Configurable confidence thresholds and fallback strategies

### 3. Conversation Memory Management
- Persistent conversation context across sessions
- Optimized prompt engineering for Mexican healthcare context
- Token usage optimization and context pruning

## UI/UX Design Patterns

### 1. Progressive Web App (PWA) Pattern
- Service worker for offline functionality
- App-like experience with install prompts
- Optimized for mobile-first Mexican healthcare market

### 2. Responsive Design System
- Mobile-first approach with breakpoint strategy
- Custom Tailwind configuration with brand colors
- Accessibility-first component design

### 3. Loading States & Error Boundaries
- Comprehensive error handling with fallbacks
- Loading skeletons for better perceived performance
- Graceful degradation for network issues

## Healthcare-Specific Patterns

### 1. Medical Compliance Framework
- HIPAA-style privacy protection patterns
- Medical disclaimer and consent management
- Cultural sensitivity validation for Mexican context

### 2. Image Analysis Workflow
- Structured medical image capture and analysis
- Multi-stage processing with confidence scoring
- Integration with treatment recommendation system

### 3. Questionnaire State Machine
- XState for complex health questionnaire flows
- Type-safe state transitions
- Progress tracking and resume capability

## Security Patterns

### 1. Client-Side Encryption
- Sensitive data encryption before storage
- Secure API key management
- Token-based authentication with Supabase

### 2. Input Validation & Sanitization
- Medical input validation patterns
- XSS prevention with DOMPurify
- Type-safe form handling with TypeScript

## Performance Patterns

### 1. Code Splitting & Lazy Loading
- Route-based code splitting
- Lazy loading of heavy components
- Dynamic imports for AI services

### 2. Caching Strategy
- React Query for server state caching
- Browser storage for offline capabilities
- Intelligent cache invalidation

### 3. Bundle Optimization
- Tree shaking for unused code elimination
- Optimized dependency management
- Asset optimization for Mexican bandwidth conditions

## Development Guidelines

### 1. TypeScript First
- Strict type checking enabled
- Interface-driven development
- Generic types for reusable components

### 2. Composition Over Inheritance
- Functional components with hooks
- Higher-order components for cross-cutting concerns
- Custom hooks for business logic

### 3. Mexican Healthcare Context
- Spanish-first localization strategy
- Cultural adaptation for medical terminology
- Regional compliance and regulation adherence