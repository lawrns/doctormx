/**
 * Triage Data Module
 * Medical rules and patterns for emergency detection
 */

export {
  // Loader functions
  loadInformationalKeywords,
  loadEducationalKeywords,
  loadEmergencyPatterns,
  loadRedFlagCategories,
  
  // Convenience getters
  getInformationalKeywords,
  getEducationalKeywords,
  getAllEmergencyPatterns,
  getEmergencyPatternsByCategory,
  getCriticalRuleCategories,
  getCriticalRuleIds,
  getCareLevelInfo,
  getSeverityScore,
  getCareLevelPriority,
  getMentalHealthResources,
  isCriticalRule,
  
  // Default export
  default,
} from './loader';

export type {
  CareLevel,
  InformationalKeywordsData,
  EducationalKeywordsData,
  EmergencyPatternsData,
  RedFlagCategoriesData,
  CareLevelInfo,
  MentalHealthResource,
} from './loader';
