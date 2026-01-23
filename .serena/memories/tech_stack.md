# DoctorMX Technology Stack

## Frontend
- **React 18.2.0** - Main UI framework with TypeScript
- **TypeScript 5.2.2** - Type safety with strict mode enabled
- **Vite 4.5.14** - Build tool and dev server
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **React Router DOM 6.16.0** - Client-side routing

## State Management
- **XState 4.38.2** - State machine library
- **@xstate/react 3.2.2** - React bindings for XState
- **@tanstack/react-query 5.28.4** - Server state management
- **React Context API** - Local state management

## UI Libraries
- **Framer Motion 10.16.4** - Animation library
- **Lucide React 0.288.0** - Icon library
- **Recharts 2.15.3** - Data visualization
- **DOMPurify 3.2.6** - HTML sanitization

## Backend & Services
- **Supabase 2.38.4** - PostgreSQL database, authentication, and storage
- **OpenAI 4.100.0** - AI/LLM integration
- **Netlify Functions** - Serverless backend endpoints
- **Crypto-JS 4.2.0** - Encryption services

## Internationalization
- **i18next 25.2.1** - Internationalization framework
- **react-i18next 15.5.2** - React bindings
- **i18next-browser-languagedetector 8.1.0** - Language detection

## Development Tools
- **ESLint** - Code linting with TypeScript support
- **Playwright** - E2E testing framework
- **Netlify CLI 22.1.3** - Local development and deployment

## Build Configuration
- Path aliases: `@/` for src, `@pkg/` for packages, `@svc/` for services
- Code splitting with manual chunks
- Target: ES2020
- Module resolution: bundler mode
- JSX: react-jsx with automatic runtime