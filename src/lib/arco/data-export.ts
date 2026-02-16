/**
 * ARCO Data Export (Legacy Entry Point)
 *
 * ⚠️ DEPRECATED: This file is kept for backward compatibility.
 * Please import from '@/lib/arco/export' instead.
 *
 * @example
 * // Old way (still works but deprecated):
 * import { exportUserDataToJson } from '@/lib/arco/data-export'
 *
 * // New way (recommended):
 * import { exportUserDataToJson } from '@/lib/arco/export'
 * // or
 * import { exportUserDataToJson } from '@/lib/arco'
 *
 * @module arco/data-export
 * @deprecated Use '@/lib/arco/export' instead
 */

// Re-export everything from the new modular structure
export * from './export'
