# Code Coverage Requirements (TST-008)

## Overview

This document defines the code coverage requirements and configuration for the Doctor.mx project. Coverage thresholds are enforced in CI/CD to maintain code quality and reliability.

## Coverage Thresholds

### Global Thresholds (Overall)

| Metric | Threshold | Description |
|--------|-----------|-------------|
| Lines | 80% | Minimum line coverage across the codebase |
| Functions | 80% | Minimum function coverage across the codebase |
| Branches | 70% | Minimum branch coverage across the codebase |
| Statements | 80% | Minimum statement coverage across the codebase |

### Per-File Thresholds

| Threshold | Description |
|-----------|-------------|
| 60% | Minimum coverage required for each individual file |

> **Note**: Critical files (API routes, security utilities) should aim for 100% coverage.

## Configuration

### Vitest Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 70,
    statements: 80,
    perFile: 60,
    autoUpdate: false, // Strict enforcement
  },
  // ... include/exclude patterns
}
```

### Included Files

The following directories are included in coverage analysis:

- `src/app/api/**/*` - API routes
- `src/components/**/*` - React components
- `src/lib/**/*` - Core business logic
- `src/hooks/**/*` - Custom React hooks
- `src/services/**/*` - Service layer
- `src/utils/**/*` - Utility functions

### Excluded Files

The following are excluded from coverage analysis:

- Test files (`*.test.ts`, `*.test.tsx`)
- Mock files and utilities
- Type definitions
- Configuration files
- Entry points (layout, page, error components)
- Generated files

## CI/CD Integration

### GitHub Actions Workflow

Coverage is checked automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

Workflow file: `.github/workflows/coverage.yml`

### CI Behavior

1. **Tests run with coverage**: `npm run test:coverage`
2. **Threshold enforcement**: Build fails if coverage is below thresholds
3. **Artifacts uploaded**: Coverage reports are saved for 30 days
4. **PR comments**: Coverage summary is posted on pull requests

### Failing the Build

The CI will fail if:
- Overall coverage drops below 80% (lines, functions, statements)
- Branch coverage drops below 70%
- Any file has less than 60% coverage
- Coverage report generation fails

## Running Coverage Locally

### Generate Coverage Report

```bash
# Run tests with coverage
npm run test:coverage

# Or use vitest directly
npx vitest run --coverage
```

### View Coverage Report

After running coverage:

```bash
# Open HTML report
open coverage/index.html

# Or on Windows
start coverage/index.html
```

### Watch Mode with Coverage

```bash
# Run tests in watch mode (coverage updates on each run)
npx vitest --coverage --watch
```

## Coverage Reports

### Report Types

| Format | File | Description |
|--------|------|-------------|
| Text | Console output | Summary shown in terminal |
| JSON | `coverage/coverage-final.json` | Detailed coverage data |
| HTML | `coverage/index.html` | Visual report with file breakdown |
| LCOV | `coverage/lcov.info` | Standard format for external tools |

### Watermarks

Coverage watermarks are configured for visual indicators:

| Metric | Low | High |
|--------|-----|------|
| Lines | 80% | 95% |
| Functions | 80% | 95% |
| Branches | 70% | 90% |
| Statements | 80% | 95% |

## Best Practices

### Writing Testable Code

1. **Keep functions small and focused**: Easier to test completely
2. **Avoid side effects**: Pure functions are easier to test
3. **Use dependency injection**: Mock external dependencies
4. **Separate concerns**: Business logic separate from UI

### Testing Guidelines

1. **Test happy paths**: Normal operation scenarios
2. **Test error cases**: Exception handling and error states
3. **Test edge cases**: Boundary conditions and unusual inputs
4. **Test integration points**: API calls, database operations

### Coverage Improvement

If coverage is below threshold:

1. Identify uncovered code using HTML report
2. Write tests for uncovered branches/lines
3. Remove dead code if no longer needed
4. Refactor difficult-to-test code

## Troubleshooting

### Common Issues

#### Coverage Not Generated

```bash
# Ensure coverage dependencies are installed
npm install -D @vitest/coverage-v8

# Clear cache and retry
rm -rf coverage/
npx vitest run --coverage
```

#### Thresholds Too Strict

If legitimate code cannot be tested:

1. Add to exclude list (requires justification)
2. Use `/* istanbul ignore next */` for specific lines
3. Document why testing is not feasible

#### Per-File Threshold Failing

Individual files must meet 60% threshold:
- Break down large files into smaller, testable units
- Add tests for critical uncovered paths
- Consider if file should be excluded (e.g., generated code)

## Badge

The coverage badge in README.md links to this documentation:

```markdown
[![Coverage](https://img.shields.io/badge/Coverage-80%25-brightgreen)](./docs/testing/COVERAGE_REQUIREMENTS.md)
```

## Resources

- [Vitest Coverage Documentation](https://vitest.dev/guide/coverage.html)
- [v8 Coverage Provider](https://vitest.dev/config/#coverage-provider)
- [Istanbul Coverage](https://istanbul.js.org/)

## Related Documents

- [Testing Guide](../../TESTING_GUIDE.md)
- [CI/CD Workflows](../../.github/workflows/)
- [Vitest Configuration](../../vitest.config.ts)

---

**Last Updated**: 2026-02-16  
**Ticket**: TST-008  
**Status**: ✅ Implemented
