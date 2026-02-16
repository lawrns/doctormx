# Contributing to DoctorMX

Thank you for your interest in contributing to DoctorMX! This document provides guidelines and instructions for contributing to our healthcare platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Security Considerations](#security-considerations)
- [Legal and Compliance](#legal-and-compliance)
- [Questions?](#questions)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- **Be respectful**: Treat everyone with respect. Healthy debate is encouraged, but harassment is not tolerated.
- **Be patient**: Remember that contributors have varying experience levels.
- **Be constructive**: Provide constructive feedback and be open to receiving it.
- **Be professional**: Maintain professionalism in all interactions.

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Bun package manager (recommended) or npm
- Git
- Docker (for local database)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Fork via GitHub UI, then clone your fork
   git clone https://github.com/YOUR_USERNAME/doctormx.git
   cd doctormx
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

### Development Environment

We provide a complete development environment using Docker Compose:

```bash
# Start all services (database, redis, etc.)
docker-compose up -d

# Run database migrations
bun db:migrate

# Seed development data
bun db:seed
```

## Development Workflow

### Branching Strategy

We follow a modified GitFlow workflow:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features (branch from `develop`)
- `bugfix/*`: Bug fixes (branch from `develop`)
- `hotfix/*`: Critical fixes (branch from `main`)
- `release/*`: Release preparation

### Creating a Branch

```bash
# Fetch latest changes
git fetch origin

# Create feature branch
git checkout -b feature/your-feature-name develop

# Or create bugfix branch
git checkout -b bugfix/issue-description develop
```

Branch naming conventions:
- Features: `feature/short-description` or `feature/PROJ-123-short-desc`
- Bugfixes: `bugfix/issue-number-short-desc`
- Hotfixes: `hotfix/critical-issue-desc`

## Coding Standards

### TypeScript/JavaScript

We use strict TypeScript configuration. Key requirements:

```typescript
// ✅ DO: Use explicit types
function calculateDosage(weight: number, age: number): number {
  // implementation
}

// ❌ DON'T: Use implicit any
function calculateDosage(weight, age) {
  // implementation
}
```

### React Components

Follow these patterns for React components:

```typescript
/**
 * Component description
 * 
 * @component ComponentName
 */
'use client' // or 'use server' for server components

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ComponentProps {
  /** Description of prop */
  requiredProp: string
  /** Optional prop with default */
  optionalProp?: boolean
}

export function ComponentName({ 
  requiredProp, 
  optionalProp = false 
}: ComponentProps) {
  // Component logic
  
  return (
    // JSX
  )
}
```

### Styling (Tailwind CSS)

```typescript
// ✅ DO: Use Tailwind classes with cn() utility
<div className={cn(
  "flex items-center gap-4",
  isActive && "bg-blue-100",
  className
)}>

// ❌ DON'T: Use inline styles or arbitrary values without reason
<div style={{ marginTop: '10px' }}>
```

### File Organization

```
src/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── forms/             # Form-specific components
│   ├── legal/             # Legal/compliance components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Database clients
│   ├── consent/           # Consent management
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript types
└── styles/                # Global styles
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or corrections
- `chore`: Build process or auxiliary tool changes
- `security`: Security-related changes
- `compliance`: Legal/compliance changes

### Examples

```bash
# Feature
feat(consent): add medical disclaimer acknowledgment flow

# Bug fix
fix(auth): resolve session timeout issue

# Documentation
docs(api): update authentication endpoints

# Security fix
security(encryption): upgrade to AES-256-GCM

# Compliance
compliance(hipaa): implement audit log encryption
```

### Scopes

Common scopes:
- `auth`: Authentication
- `api`: API endpoints
- `ui`: User interface
- `db`: Database
- `consent`: Consent management
- `security`: Security features
- `legal`: Legal features
- `ai`: AI/ML features

## Pull Request Process

### Before Submitting

1. **Run all tests**
   ```bash
   bun test
   bun test:e2e
   ```

2. **Check TypeScript**
   ```bash
   bun type-check
   ```

3. **Lint your code**
   ```bash
   bun lint
   bun lint:fix
   ```

4. **Verify build**
   ```bash
   bun build
   ```

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security fix
- [ ] Compliance update

## Security Checklist (if applicable)
- [ ] No PHI/PII in logs
- [ ] Input validation implemented
- [ ] Authorization checks added
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection verified

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Compliance
- [ ] Privacy impact assessed
- [ ] Security review completed
- [ ] Documentation updated

## Screenshots (if applicable)
[Add screenshots here]

## Additional Notes
[Any additional information]
```

### Review Process

1. All PRs require at least 2 approvals
2. Security-sensitive changes require security team approval
3. Compliance changes require legal/compliance review
4. All checks must pass before merging

## Testing Requirements

### Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { calculateDosage } from './dosage'

describe('calculateDosage', () => {
  it('should calculate correct dosage for adult', () => {
    const result = calculateDosage(70, 30)
    expect(result).toBe(500)
  })

  it('should throw error for invalid weight', () => {
    expect(() => calculateDosage(-1, 30)).toThrow('Invalid weight')
  })
})
```

### Integration Tests

```typescript
import { describe, it, expect } from 'vitest'
import { createClient } from '@/lib/supabase/server'

describe('Consent API', () => {
  it('should store acknowledgment', async () => {
    const response = await fetch('/api/consent/acknowledge', {
      method: 'POST',
      body: JSON.stringify({ type: 'ai_analysis' })
    })
    expect(response.status).toBe(200)
  })
})
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('patient can acknowledge medical disclaimer', async ({ page }) => {
  await page.goto('/consent/acknowledgment')
  
  await page.check('input[data-testid="disclaimer-ack"]')
  await page.click('button[data-testid="continue-btn"]')
  
  await expect(page).toHaveURL('/app/ai-consulta')
})
```

### Test Coverage Requirements

- Minimum 80% code coverage
- 100% coverage for security-critical code
- 100% coverage for consent/compliance features

## Security Considerations

### PHI/PII Handling

- Never log PHI/PII
- Use tokenization for sensitive data
- Implement field-level encryption
- Follow data minimization principles

```typescript
// ✅ DO: Log without PHI
logger.info('User accessed medical record', { 
  userId: user.id,
  recordId: record.id,
  // NOT: diagnosis, symptoms, etc.
})

// ❌ DON'T: Log PHI
logger.info('Patient diagnosed', { 
  patientId: patient.id,
  diagnosis: 'Diabetes Type 2', // ❌ PHI!
})
```

### Authentication & Authorization

- Always verify authentication
- Check authorization for every operation
- Use principle of least privilege

```typescript
// ✅ DO: Check permissions
async function getMedicalRecord(recordId: string, userId: string) {
  const record = await db.records.findById(recordId)
  
  if (record.patientId !== userId && !await isAuthorizedDoctor(userId, recordId)) {
    throw new UnauthorizedError('Access denied')
  }
  
  return record
}
```

### Input Validation

```typescript
import { z } from 'zod'

const patientSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  dateOfBirth: z.date().max(new Date()),
})

// Validate all inputs
const validated = patientSchema.parse(input)
```

## Legal and Compliance

### License

By contributing, you agree that your contributions will be licensed under our [LICENSE](./LICENSE).

### Contributor License Agreement (CLA)

All contributors must sign our CLA before contributions can be merged. The CLA:
- Grants DoctorMX permission to use your contributions
- Confirms you have the right to contribute the code
- Acknowledges your contributions are your original work

### Compliance Requirements

Contributions affecting compliance features must:

1. Include compliance review
2. Update relevant documentation
3. Pass security review
4. Include audit trail considerations

### Prohibited Contributions

We cannot accept contributions that:
- Circumvent security controls
- Bypass consent requirements
- Disable audit logging
- Expose PHI without authorization
- Violate any laws or regulations

## Questions?

### Getting Help

- **Technical questions**: Open a GitHub Discussion
- **Security concerns**: Email security@doctor.mx
- **Compliance questions**: Email legal@doctor.mx
- **General inquiries**: Email contribute@doctor.mx

### Resources

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Security Policy](./docs/SECURITY.md)
- [HIPAA Compliance](./docs/compliance/HIPAA-checklist.md)

---

## Recognition

Contributors will be recognized in our:
- Release notes
- Contributors page (with permission)
- Annual report

Thank you for helping make healthcare more accessible!

---

*Last updated: February 2025*
