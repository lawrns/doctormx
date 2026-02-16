# DoctorMX Test Coverage Configuration

**Project:** DoctorMX  
**Policy:** 100% APIs, 90% Components  
**Last Updated:** 2026-02-16

---

## Coverage Thresholds

### By Component Type

| Component | Lines | Functions | Branches | Statements |
|-----------|-------|-----------|----------|------------|
| **API Routes** | 100% | 100% | 100% | 100% |
| **Components** | 90% | 90% | 85% | 90% |
| **Shared Utils** | 95% | 95% | 90% | 95% |
| **Global Minimum** | 85% | 85% | 80% | 85% |

### Rationale

- **API Routes (100%)**: Critical business logic, must be fully tested
- **Components (90%)**: UI can have edge cases, but main flows must be covered
- **Shared Utils (95%)**: Reused code needs high confidence

---

## Coverage Configuration

**File:** `vitest.config.ts`

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html', 'lcov'],
  reportsDirectory: './coverage',
  thresholds: {
    lines: 85,
    functions: 85,
    branches: 80,
    statements: 85,
  },
  // ... exclusions
}
```

---

## Coverage Exclusions

### Always Excluded

| Pattern | Reason |
|---------|--------|
| `node_modules/` | Third-party code |
| `.next/` | Build output |
| `dist/` | Build output |
| `coverage/` | Previous coverage reports |

### Test-Related Exclusions

| Pattern | Reason |
|---------|--------|
| `**/*.test.ts` | Test files |
| `**/*.test.tsx` | Test files |
| `**/*.property.test.ts` | Property-based tests |
| `**/__tests__/**` | Test directories |
| `**/mocks.ts` | Mock utilities |
| `**/mocks/**` | Mock directories |
| `**/test-utils.ts` | Test utilities |
| `**/test-utils/**` | Test utility directories |

### Type Definition Exclusions

| Pattern | Reason |
|---------|--------|
| `**/types.ts` | Type definitions only |
| `**/types/**` | Type directories |
| `**/*.d.ts` | Declaration files |

### Configuration Exclusions

| Pattern | Reason |
|---------|--------|
| `**/config/**` | Configuration directories |
| `**/*.config.ts` | Config files |
| `**/*.config.js` | Config files |

### Next.js Entry Points (Minimal Logic)

| Pattern | Reason |
|---------|--------|
| `src/middleware.ts` | Next.js middleware entry |
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Root page |
| `src/app/loading.tsx` | Loading UI |
| `src/app/error.tsx` | Error UI |
| `src/app/not-found.tsx` | 404 page |
| `src/app/sitemap.ts` | Sitemap generator |
| `src/app/robots.ts` | Robots.txt generator |
| `src/app/manifest.ts` | Web manifest |
| `src/app/**/layout.tsx` | Nested layouts |
| `src/app/**/loading.tsx` | Nested loading |
| `src/app/**/error.tsx` | Nested errors |
| `src/app/**/page.tsx` | Nested pages |

### Generated Files

| Pattern | Reason |
|---------|--------|
| `**/generated/**` | Auto-generated code |

---

## Running Coverage

### Basic Coverage Report

```bash
# Run tests with coverage
npm run test -- --coverage

# Run coverage only
npx vitest run --coverage
```

### Coverage Reports

After running coverage, reports are available at:

| Format | Location | Use Case |
|--------|----------|----------|
| HTML | `./coverage/index.html` | Human-readable report |
| JSON | `./coverage/coverage-final.json` | CI/CD integration |
| LCOV | `./coverage/lcov.info` | External tools (Code Climate, etc.) |
| Text | Console output | Quick check |

### Watch Mode

```bash
# Run tests in watch mode with coverage
npx vitest --coverage --watch
```

### Specific Files

```bash
# Coverage for specific file
npx vitest run --coverage src/lib/utils.ts

# Coverage for specific directory
npx vitest run --coverage src/components/
```

---

## Coverage Enforcement

### Build Failure

The build **WILL FAIL** if coverage thresholds are not met:

```
ERROR: Coverage for lines (82%) does not meet threshold (85%)
ERROR: Coverage for functions (80%) does not meet threshold (85%)
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

---

## Coverage Best Practices

### 1. Test Critical Paths First

```typescript
// ✅ Test the main use case
it('should create appointment successfully', async () => {
  const result = await createAppointment(validData);
  expect(result.status).toBe(201);
});

// Then test edge cases
it('should reject invalid data', async () => {
  const result = await createAppointment(invalidData);
  expect(result.status).toBe(400);
});
```

### 2. Don't Chase 100% Blindly

```typescript
// ❌ Don't test trivial code just for coverage
function add(a: number, b: number): number {
  return a + b;
}

// ✅ Focus on business logic
async function processPayment(paymentData: PaymentData): Promise<Result> {
  // Complex validation, API calls, error handling
}
```

### 3. Use Coverage Gaps to Find Untested Code

```bash
# View HTML report to see uncovered lines
open ./coverage/index.html
```

### 4. Exclude Untestable Code Properly

```typescript
// Add istanbul ignore for truly untestable code
/* istanbul ignore next */
function initThirdPartyLibrary(): void {
  // External library initialization
}
```

---

## Coverage Reports

### HTML Report Sections

1. **Overview**: Summary of all files
2. **Files**: Detailed per-file coverage
3. **Code View**: Line-by-line coverage with:
   - 🟢 Green: Covered
   - 🔴 Red: Not covered
   - 🟡 Yellow: Partially covered (branches)

### Reading Coverage Metrics

```
File: src/lib/appointment.ts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Statements   : 95.23% ( 40/42 )
Branches     : 87.5%  ( 14/16 )
Functions    : 100%   ( 8/8 )
Lines        : 94.44% ( 34/36 )
```

- **Statements**: Executable statements
- **Branches**: if/else, switch, ternary coverage
- **Functions**: Functions called
- **Lines**: Lines executed

---

## Troubleshooting

### Coverage Not Updating

```bash
# Clear coverage cache
rm -rf coverage/
npx vitest run --coverage
```

### Threshold Too High

If you need to adjust thresholds temporarily:

```typescript
// vitest.config.ts
thresholds: {
  lines: process.env.CI ? 85 : 70,  // Lower for local dev
}
```

### Missing Coverage for Interface

Interfaces and types don't generate coverage (no runtime code):

```typescript
// This won't show in coverage (expected)
export interface UserData {
  id: string;
  name: string;
}
```

---

## Goals

| Milestone | Target Date | Coverage Goal |
|-----------|-------------|---------------|
| Week 1 | 2026-02-23 | 50% baseline |
| Week 2 | 2026-03-02 | 70% |
| Week 3 | 2026-03-09 | 85% (threshold) |
| Week 4 | 2026-03-16 | 90% |
| Week 5 | 2026-03-23 | 95% APIs, 90% Components |
