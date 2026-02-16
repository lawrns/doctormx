/**
 * Data Loader for Triage Medical Rules
 * Loads JSON data files with strict typing
 */

import informationalKeywordsData from './informational-keywords.json';
import educationalKeywordsData from './educational-keywords.json';
import emergencyPatternsData from './emergency-patterns.json';
import redFlagCategoriesData from './red-flag-categories.json';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Care level for triage evaluation */
export type CareLevel = 'ER' | 'URGENT' | 'PRIMARY' | 'SELFCARE';

/** Informational keywords data structure */
export interface InformationalKeywordsData {
  description: string;
  note: string;
  keywords: string[];
}

/** Educational keywords data structure */
export interface EducationalKeywordsData {
  description: string;
  note: string;
  keywords: string[];
}

/** Single pattern category with string array */
interface SimplePatternCategory {
  description: string;
  severity: CareLevel;
  patterns: string[];
}

/** Pattern category with compound patterns (AND logic) */
interface CompoundPatternCategory {
  description: string;
  severity: CareLevel;
  patterns: {
    [key: string]: string[];
  };
}

/** Emergency patterns data structure */
export interface EmergencyPatternsData {
  description: string;
  version: string;
  categories: {
    cardiac: SimplePatternCategory;
    respiratory: SimplePatternCategory;
    mental_health: SimplePatternCategory;
    stroke_facial: SimplePatternCategory;
    stroke_arm: SimplePatternCategory;
    stroke_speech: SimplePatternCategory;
    stroke_direct: SimplePatternCategory;
    seizure: SimplePatternCategory;
    loss_consciousness: SimplePatternCategory;
    severe_bleeding: SimplePatternCategory;
    anaphylaxis: SimplePatternCategory;
    thunderclap_headache: SimplePatternCategory;
    pregnancy: SimplePatternCategory;
    altered_mental_status: SimplePatternCategory;
    acute_abdomen: SimplePatternCategory;
    vision_emergency: SimplePatternCategory;
    dvt: SimplePatternCategory;
    meningitis: SimplePatternCategory;
    critical_fever: SimplePatternCategory;
    severe_hypoglycemia: CompoundPatternCategory;
    symptomatic_bradycardia: CompoundPatternCategory;
  };
}

/** Care level information */
export interface CareLevelInfo {
  label: string;
  color: string;
  icon: string;
  description: string;
  severity_score: number;
}

/** Mental health resource */
export interface MentalHealthResource {
  name: string;
  phone: string;
  availability: string;
  cost: string;
}

/** Red flag categories data structure */
export interface RedFlagCategoriesData {
  description: string;
  critical_rules: {
    description: string;
    rule_ids: string[];
    categories: string[];
  };
  care_levels: {
    ER: CareLevelInfo;
    URGENT: CareLevelInfo;
    PRIMARY: CareLevelInfo;
    SELFCARE: CareLevelInfo;
  };
  priority_order: CareLevel[];
  mental_health_resources: {
    description: string;
    resources: MentalHealthResource[];
  };
}

// ============================================================================
// LOADER FUNCTIONS
// ============================================================================

/**
 * Load informational keywords for detecting past-tense/third-party queries
 * @returns InformationalKeywordsData object
 */
export function loadInformationalKeywords(): InformationalKeywordsData {
  return informationalKeywordsData as InformationalKeywordsData;
}

/**
 * Load educational keywords for detecting educational queries
 * @returns EducationalKeywordsData object
 */
export function loadEducationalKeywords(): EducationalKeywordsData {
  return educationalKeywordsData as EducationalKeywordsData;
}

/**
 * Load emergency patterns for medical emergency detection
 * @returns EmergencyPatternsData object
 */
export function loadEmergencyPatterns(): EmergencyPatternsData {
  return emergencyPatternsData as EmergencyPatternsData;
}

/**
 * Load red flag categories and configuration
 * @returns RedFlagCategoriesData object
 */
export function loadRedFlagCategories(): RedFlagCategoriesData {
  return redFlagCategoriesData as RedFlagCategoriesData;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Get informational keywords array only
 * @returns Array of informational keyword strings
 */
export function getInformationalKeywords(): string[] {
  return loadInformationalKeywords().keywords;
}

/**
 * Get educational keywords array only
 * @returns Array of educational keyword strings
 */
export function getEducationalKeywords(): string[] {
  return loadEducationalKeywords().keywords;
}

/**
 * Get all emergency patterns flattened into a single array
 * @returns Flat array of all emergency pattern strings
 */
export function getAllEmergencyPatterns(): string[] {
  const patterns = loadEmergencyPatterns();
  const allPatterns: string[] = [];

  for (const category of Object.values(patterns.categories)) {
    if (Array.isArray(category.patterns)) {
      allPatterns.push(...category.patterns);
    } else {
      // Compound patterns - flatten all sub-arrays
      for (const subPatterns of Object.values(category.patterns)) {
        allPatterns.push(...subPatterns);
      }
    }
  }

  return [...new Set(allPatterns)]; // Remove duplicates
}

/**
 * Get patterns for a specific emergency category
 * @param category - Category name from EmergencyPatternsData['categories']
 * @returns Array of patterns for the category, or null if not found
 */
export function getEmergencyPatternsByCategory(
  category: keyof EmergencyPatternsData['categories']
): string[] | null {
  const patterns = loadEmergencyPatterns();
  const categoryData = patterns.categories[category];

  if (!categoryData) {
    return null;
  }

  if (Array.isArray(categoryData.patterns)) {
    return categoryData.patterns;
  }

  // Compound patterns - flatten
  const flattened: string[] = [];
  for (const subPatterns of Object.values(categoryData.patterns)) {
    flattened.push(...subPatterns);
  }
  return flattened;
}

/**
 * Get critical rule categories that bypass informational filtering
 * @returns Array of critical rule category identifiers
 */
export function getCriticalRuleCategories(): string[] {
  return loadRedFlagCategories().critical_rules.categories;
}

/**
 * Get critical rule IDs that bypass informational filtering
 * @returns Array of critical rule IDs
 */
export function getCriticalRuleIds(): string[] {
  return loadRedFlagCategories().critical_rules.rule_ids;
}

/**
 * Get care level information
 * @param level - Care level to get info for
 * @returns CareLevelInfo object
 */
export function getCareLevelInfo(level: CareLevel): CareLevelInfo {
  return loadRedFlagCategories().care_levels[level];
}

/**
 * Get severity score for a care level
 * @param level - Care level
 * @returns Severity score (0-100)
 */
export function getSeverityScore(level: CareLevel): number {
  return getCareLevelInfo(level).severity_score;
}

/**
 * Get priority order for care levels (higher index = more urgent)
 * @returns Array of care levels in priority order
 */
export function getCareLevelPriority(): CareLevel[] {
  return loadRedFlagCategories().priority_order;
}

/**
 * Get mental health resources
 * @returns Array of mental health resources
 */
export function getMentalHealthResources(): MentalHealthResource[] {
  return loadRedFlagCategories().mental_health_resources.resources;
}

/**
 * Check if a rule ID is a critical rule
 * @param ruleId - Rule ID to check
 * @returns True if the rule is critical
 */
export function isCriticalRule(ruleId: string): boolean {
  const criticalIds = getCriticalRuleIds();
  const criticalCategories = getCriticalRuleCategories();
  
  return criticalIds.includes(ruleId) || 
         criticalCategories.some(cat => ruleId.includes(cat));
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  loadInformationalKeywords,
  loadEducationalKeywords,
  loadEmergencyPatterns,
  loadRedFlagCategories,
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
};
