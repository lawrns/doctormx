/**
 * ComprehensiveMedicalImageAnalyzer - Redirector to RealComprehensiveMedicalImageAnalyzer
 * 
 * This file exists for backward compatibility. All functionality has been moved to
 * RealComprehensiveMedicalImageAnalyzer which provides actual image analysis capabilities.
 */

// Re-export everything from the real analyzer
export * from './RealComprehensiveMedicalImageAnalyzer';
export { RealComprehensiveMedicalImageAnalyzer as ComprehensiveMedicalImageAnalyzer } from './RealComprehensiveMedicalImageAnalyzer';

// Re-export the singleton instance
import { RealComprehensiveMedicalImageAnalyzer } from './RealComprehensiveMedicalImageAnalyzer';
export const comprehensiveMedicalImageAnalyzer = RealComprehensiveMedicalImageAnalyzer.getInstance();

console.warn('⚠️ DEPRECATION WARNING: ComprehensiveMedicalImageAnalyzer has been replaced with RealComprehensiveMedicalImageAnalyzer');
console.warn('Please update your imports to use RealComprehensiveMedicalImageAnalyzer directly.');