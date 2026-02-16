/**
 * AI Confidence Scoring System
 *
 * @deprecated This file is kept for backward compatibility.
 * Please import from `@/lib/ai/confidence` instead.
 *
 * @example
 * ```typescript
 * // Old import (still works but deprecated)
 * import { confidenceCalculator } from '@/lib/ai/confidence';
 *
 * // New recommended import
 * import { confidenceCalculator } from '@/lib/ai/confidence';
 * ```
 */

// Re-export everything from the new module structure
export * from './confidence/index';

// Default export
export { confidenceCalculator as default } from './confidence/index';
