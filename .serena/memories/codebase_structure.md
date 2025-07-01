# DoctorMX - Codebase Structure

## Root Level
- `package.json` - Node.js dependencies and scripts
- `tsconfig.json` - TypeScript configuration (references app and node configs)
- `tailwind.config.js` - Tailwind CSS configuration with custom brand theme
- `eslint.config.js` - ESLint configuration for TypeScript and React
- `vite.config.js` - Vite build configuration
- `netlify.toml` - Netlify deployment configuration
- `CLAUDE.md` - Claude Code configuration and enhancement system

## Source Structure (`src/`)
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, etc.)
│   ├── auth/           # Authentication components
│   ├── ai/             # AI-related components
│   ├── medical-imaging/ # Medical image capture and analysis
│   ├── progress/       # Health progress tracking
│   ├── seo/            # SEO optimization components
│   └── ...
├── features/           # Feature-specific modules
│   ├── ai-doctor/      # AI doctor chat and consultation
│   ├── ai-image-analysis/ # Medical image analysis
│   └── lab-testing/    # Laboratory testing features
├── pages/              # Page components and routing
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin dashboard pages
│   ├── appointments/   # Appointment management
│   └── ...
├── contexts/           # React Context providers
├── core/               # Core application components and services
│   ├── components/     # Layout components (Navbar, Sidebar, etc.)
│   ├── hooks/          # Custom React hooks
│   └── services/       # Core services (AI, encryption, etc.)
├── lib/                # Helper libraries and utilities
├── services/           # External service integrations
├── utils/              # Utility functions
├── styles/             # Global styles and CSS
├── types/              # TypeScript type definitions
└── pwa/                # Progressive Web App components
```

## Backend Structure (`netlify/functions/`)
- Serverless functions for API endpoints
- Image analysis processing
- AI model integration
- WhatsApp webhook handling

## Configuration Files
- `tsconfig.app.json` - Main TypeScript configuration
- `tsconfig.node.json` - Node.js TypeScript configuration
- `playwright.config.ts` - E2E testing configuration
- `postcss.config.cjs` - PostCSS configuration

## Special Directories
- `public/` - Static assets, PWA manifest, service worker
- `supabase/` - Database migrations and schema
- `e2e/` - End-to-end test specifications
- `brain/` - AI logic and conversation management
- `zen-mcp-server/` - MCP (Model Context Protocol) server integration

## Development Patterns
- Feature-based organization for complex functionality
- Shared components in `/components/ui/`
- Context providers for global state
- Custom hooks for reusable logic
- TypeScript interfaces for type safety
- Barrel exports for clean imports