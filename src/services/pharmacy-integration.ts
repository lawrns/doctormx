/**
 * @deprecated Use `services/pharmacy` instead
 * This file is kept for backward compatibility
 */

// Re-export everything from the pharmacy module
export * from './pharmacy';

// Import and re-export pharmacyAPI as the default
import { pharmacyAPI } from './pharmacy-api';
export default pharmacyAPI;
