/**
 * Shim for date-fns/locale 
 * This ensures imports from date-fns/locale work properly
 */

// Re-export from date-fns
export * from 'date-fns';

// Create locale object if imports from date-fns/locale are used
// Common locales that might be used
export const es = { code: 'es' };
export const enUS = { code: 'en-US' };

export default {
  es,
  enUS
};
