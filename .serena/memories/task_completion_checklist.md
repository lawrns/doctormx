# DoctorMX Task Completion Checklist

## When Completing a Coding Task

### 1. Code Quality Checks
- [ ] Run `npm run lint` to check for linting errors
- [ ] Run `npm run typecheck` to ensure TypeScript types are correct
- [ ] Fix any errors or warnings before considering task complete

### 2. Testing
- [ ] Test the feature manually in the browser
- [ ] Check mobile responsiveness
- [ ] Verify offline functionality if PWA-related
- [ ] Run relevant E2E tests if modified existing features
- [ ] Test in both Spanish and English if UI text was added

### 3. Mexican Market Compliance
- [ ] Ensure Spanish translations are accurate and culturally appropriate
- [ ] Verify medical terminology follows Mexican standards
- [ ] Check that any health advice includes appropriate disclaimers
- [ ] Confirm date/time formats use Mexican conventions

### 4. Performance Checks
- [ ] Check browser console for errors
- [ ] Verify no performance regressions
- [ ] Ensure images are optimized
- [ ] Check bundle size hasn't increased significantly

### 5. Security Review
- [ ] No hardcoded API keys or secrets
- [ ] Sensitive data is encrypted
- [ ] User inputs are properly sanitized
- [ ] Environment variables are used for configuration

### 6. Documentation
- [ ] Update relevant comments in code
- [ ] Update README if new setup steps needed
- [ ] Document any new environment variables

### 7. Git Hygiene
- [ ] Stage only relevant files
- [ ] Write clear, descriptive commit messages
- [ ] Don't commit node_modules or .env files
- [ ] Ensure no console.log statements in production code

### 8. Pre-Deployment
- [ ] Run `npm run build` to ensure production build works
- [ ] Test the production build with `npm run preview`
- [ ] Verify all environment variables are set in Netlify

## Common Issues to Check
- Missing imports or dependencies
- Broken responsive layouts
- Accessibility concerns (ARIA labels, keyboard navigation)
- Loading states and error handling
- Memory leaks in React components
- Proper cleanup in useEffect hooks