# DoctorMX Development Commands

## Essential Development Commands

### Development Server
```bash
npm run dev         # Start Vite dev server on port 5173
npm run dev:netlify # Start with Netlify Dev (includes functions)
```

### Building
```bash
npm run build         # Production build with Vite
npm run build:complex # Complex build with unified script
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint      # Run ESLint checks
npm run typecheck # Run TypeScript type checking
```

### Testing
```bash
npm run test:e2e        # Run Playwright E2E tests
npm run test:e2e:ui     # Run Playwright with UI mode
npm run test:e2e:report # Show Playwright test report
```

### Database Management
```bash
npm run db:migrate # Run database migrations
npm run db:reset   # Reset Supabase database
npm run db:status  # Check Supabase status
```

### Dependency Management
```bash
npm install        # Install dependencies
npm install --force # Force install (used in Netlify builds)
```

## System Commands (Darwin/macOS)

### Git Commands
```bash
git status    # Check current branch and changes
git add .     # Stage all changes
git commit -m "message"  # Commit changes
git push      # Push to remote
git pull      # Pull latest changes
git branch    # List branches
git checkout -b feature/name # Create new branch
```

### File System
```bash
ls -la        # List all files with details
cd directory  # Change directory
pwd           # Print working directory
mkdir name    # Create directory
rm -rf folder # Remove directory (careful!)
```

### Process Management
```bash
ps aux | grep node  # Find Node processes
kill -9 PID        # Force kill process
lsof -i :5173      # Check what's using port 5173
```

### Search and Find
```bash
find . -name "*.tsx" # Find all TSX files
grep -r "pattern" . # Search for pattern in files
```

## Netlify Deployment
- Deployment happens automatically on push to main branch
- Build command: `rm -rf node_modules && npm install --force && npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Environment Setup
Required environment variables in `.env.local`:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_OPENAI_API_KEY (for AI features)

## Port Information
- Development server: 5173
- Netlify Dev: 8888
- Preview server: 5173