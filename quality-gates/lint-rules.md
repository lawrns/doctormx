# DoctorMX Lint Rules Reference

**Project:** DoctorMX  
**Policy:** ZERO WARNINGS  
**Last Updated:** 2026-02-16

---

## Table of Contents

1. [Naming Conventions](#naming-conventions)
2. [Quality Rules](#quality-rules)
3. [TypeScript Rules](#typescript-rules)
4. [Exceptions](#exceptions)

---

## Naming Conventions

### Variables

```typescript
// ✅ Good
currentUser: string
maxAttempts: number
API_BASE_URL: string

// ❌ Bad
CurrentUser: string      // Should be camelCase
max_attempts: number     // Should be camelCase
apiBaseUrl: string       // Constants should be UPPER_CASE
```

### Functions

```typescript
// ✅ Good - Regular functions
function getUserData(): UserData
function calculateTotal(): number
const processPayment = (): void => {}

// ✅ Good - React Components (PascalCase allowed)
function UserProfile(): JSX.Element
const DashboardCard = (): JSX.Element => {}

// ❌ Bad
function GetUserData()      // Should be camelCase
const user_profile = () => {}  // Should be camelCase
```

### Interfaces

```typescript
// ✅ Good - Must have 'I' prefix
interface IUserData {
  id: string;
  name: string;
}

interface IApiResponse<T> {
  data: T;
  status: number;
}

// ❌ Bad
interface UserData { }      // Missing 'I' prefix
interface userData { }      // Should be PascalCase with I prefix
```

### Type Aliases

```typescript
// ✅ Good - PascalCase
export type UserRole = 'admin' | 'user' | 'guest';
export type ApiResponse<T> = { data: T; status: number };

// ❌ Bad
export type userRole = ...   // Should be PascalCase
export type api_response = ... // Should be PascalCase
```

### Classes

```typescript
// ✅ Good
class UserService { }
class ApiClient { }
class DatabaseConnection { }

// ❌ Bad
class userService { }        // Should be PascalCase
class api_client { }         // Should be PascalCase
```

### Enums

```typescript
// ✅ Good
enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

enum HttpStatusCode {
  OK = 200,
  NOT_FOUND = 404
}

// ❌ Bad
enum userStatus { }          // Should be PascalCase
enum User_Status { }         // Should be PascalCase
```

### Object Properties

```typescript
// ✅ Good
const config = {
  apiBaseUrl: '...',
  maxRetries: 3,
  timeout_ms: 5000  // snake_case allowed for external APIs
};

// ❌ Bad
const config = {
  ApiBaseUrl: '...',   // Should be camelCase
  'max-retries': 3     // Use camelCase
};
```

### Parameters

```typescript
// ✅ Good
function createUser(userId: string, isActive: boolean): void
const processData = (rawData: DataType): ResultType => {}

// ❌ Bad
function createUser(UserId: string): void    // Should be camelCase
function createUser(user_id: string): void   // Should be camelCase
```

---

## Quality Rules

### No console.log

```typescript
// ❌ Error
console.log('Debug info');
console.log(userData);

// ✅ Allowed
console.warn('Warning message');
console.error('Error message');
console.info('Information');

// ✅ Use logger service instead
import { logger } from '@/lib/logger';
logger.debug('Debug info');
logger.info('User action', { userId });
```

### No TODO/FIXME Comments

```typescript
// ❌ Warning - Use issue tracker instead
// TODO: Implement user authentication
// FIXME: Fix memory leak here
// HACK: Temporary workaround

// ✅ Good - Create GitHub issue instead
// Issue #123: Implement user authentication
```

### Explicit Return Types

```typescript
// ✅ Good
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export async function fetchUser(id: string): Promise<User> {
  const response = await api.get(`/users/${id}`);
  return response.data;
}

// ❌ Bad - Missing explicit return type
export function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### No Explicit Any

```typescript
// ❌ Error
function processData(data: any): any {
  return data.value;
}

// ✅ Good - Use proper types
function processData<T>(data: T): T {
  return data;
}

// ✅ Good - Use unknown when type is unknown
function processData(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }
  return String(data);
}
```

### Strict Equality

```typescript
// ❌ Error
if (count == 0) { }
if (value != null) { }

// ✅ Good
if (count === 0) { }
if (value !== null) { }
```

### Prefer const

```typescript
// ❌ Error
let user = { name: 'John' };
user = { name: 'Jane' };

// ✅ Good
const user = { name: 'John' };
let count = 0;  // OK - will be reassigned
count++;
```

### No Unused Variables

```typescript
// ❌ Error
function process(userId: string, unusedParam: number): void {
  console.log(userId);
}

const unusedVariable = 'test';

// ✅ Good
function process(userId: string): void {
  console.log(userId);
}

// ✅ Allowed with underscore prefix
function process(_userId: string, _options: Options): void { }
```

---

## TypeScript Rules

### Consistent Type Imports

```typescript
// ❌ Error
import { User, Config } from './types';

// ✅ Good
import type { User, Config } from './types';
// or inline
import { type User, type Config } from './types';
```

### Explicit Member Accessibility

```typescript
// ✅ Good
class UserService {
  public getUser(): User { }
  private calculateAge(): number { }
  protected validateData(): boolean { }
  
  // Constructor - public is optional
  constructor(private readonly id: string) { }
}

// ❌ Bad
class UserService {
  getUser(): User { }      // Missing 'public'
  private calculateAge() { }  // OK
}
```

### No Empty Object Type

```typescript
// ❌ Error
type Empty = {};

// ✅ Good
type Empty = Record<string, never>;
// or
type Config = object;
```

---

## Exceptions

### Scripts Directory

Files in `scripts/` have relaxed rules:
- `no-console`: off
- `explicit-function-return-type`: off

### Test Files

Files matching `*.test.ts`, `*.spec.ts`, `tests/**/*`:
- `no-console`: off
- `no-explicit-any`: off
- `explicit-function-return-type`: off
- `naming-convention`: off

### API Routes

Files in `src/app/api/**/*`:
- `explicit-function-return-type`: off (handled by Next.js)

### Config Files

Files matching `*.config.{js,mjs,ts}`:
- All rules relaxed for configuration flexibility

---

## Quick Reference Card

```
┌────────────────────┬────────────────────────────────────────┐
│ Element            │ Convention                             │
├────────────────────┼────────────────────────────────────────┤
│ Variables          │ camelCase / UPPER_CASE                 │
│ Functions          │ camelCase                              │
│ Components         │ PascalCase                             │
│ Interfaces         │ PascalCase with 'I' prefix (IUser)     │
│ Type Aliases       │ PascalCase                             │
│ Classes            │ PascalCase                             │
│ Enums              │ PascalCase                             │
│ Enum Members       │ UPPER_CASE                             │
│ Object Properties  │ camelCase / snake_case (external APIs) │
│ Parameters         │ camelCase                              │
└────────────────────┴────────────────────────────────────────┘
```

---

## Enforcement

All rules are enforced with **ERROR** level (not warning) to maintain ZERO WARNINGS policy.

**Build will fail if:**
- Any ESLint error exists
- Any TypeScript error exists
- Coverage thresholds not met
- Pre-commit hooks fail
