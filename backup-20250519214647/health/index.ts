/**
 * Health features index
 */

// Export types
export * from './types';

// Export context and hook
export { HealthProvider, useHealth } from './HealthContext';

// Export components
export { default as HealthDashboard } from './HealthDashboard';
export { default as AppleHealthConnect } from './AppleHealthConnect';

// Export service
export { default as healthService } from './healthService';
