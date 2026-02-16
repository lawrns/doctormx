/**
 * Test file for verifying quality gates
 * This file intentionally follows all naming conventions
 */

// ✅ PascalCase for interfaces with I prefix
export interface ITestData {
  id: string;
  name: string;
}

// ✅ PascalCase for type aliases
export type TestStatus = 'active' | 'inactive';

// ✅ PascalCase for enum
export enum TestCategory {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e'
}

// ✅ camelCase for functions with explicit return type
export function calculateTestScore(attempts: number): number {
  return Math.min(attempts * 10, 100);
}

// ✅ camelCase for variables
const defaultTestConfig: ITestData = {
  id: 'test-001',
  name: 'Quality Gates Test'
};

// ✅ UPPER_CASE for constants
const MAX_TEST_RETRIES: number = 3;

// ✅ camelCase class name
export class TestValidator {
  private readonly config: ITestData;

  public constructor(config: ITestData) {
    this.config = config;
  }

  public validate(): boolean {
    return this.config.id.length > 0 && this.config.name.length > 0;
  }
}

// Export for testing
export { defaultTestConfig, MAX_TEST_RETRIES };
