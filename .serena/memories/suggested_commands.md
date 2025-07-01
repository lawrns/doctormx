# DoctorMX - Suggested Shell Commands

## Development Commands
- `npm run dev` - Start development server with Netlify Dev
- `npm run start` - Alternative start command (same as dev)
- `npm run build` - Build for production using Vite
- `npm run build:complex` - Complex build using unified build script
- `npm run preview` - Preview production build locally

## Testing Commands
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with UI interface
- `npm run test:e2e:report` - Show Playwright test report

## Database Commands
- `npm run db:migrate` - Run database migrations
- `npm run db:reset` - Reset Supabase database
- `npm run db:status` - Check Supabase status

## Code Quality Commands (Note: These need to be added to package.json)
- `npm run lint` - Run ESLint (mentioned in CLAUDE.md but not in package.json)
- `npm run typecheck` - Run TypeScript checks (mentioned in CLAUDE.md but not in package.json)

## System Commands for macOS (Darwin)
- `ls` - List directory contents
- `find` - Search for files and directories
- `grep` - Search text in files (or use `rg` for ripgrep)
- `git` - Version control operations
- `cd` - Change directory
- `pwd` - Print working directory
- `which` - Locate command
- `ps` - List running processes
- `killall` - Kill processes by name

## Recommended Additional Commands
These should be added to package.json for complete development workflow:
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write src/**/*.{ts,tsx,js,jsx,json,css,md}"
  }
}
```

## Environment Setup
- Ensure Node.js >= 16.0.0 (as specified in package.json engines)
- Install dependencies: `npm install`
- Configure environment variables for Supabase and OpenAI
- Set up Netlify CLI for local development