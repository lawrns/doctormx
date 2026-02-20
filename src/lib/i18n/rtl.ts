/**
 * I18N-008: RTL (Right-to-Left) Support Module
 * 
 * Provides utilities for detecting and handling RTL (Right-to-Left) languages
 * such as Arabic, Hebrew, Persian, and Urdu.
 */

/**
 * List of RTL (Right-to-Left) locale codes
 * Includes major RTL languages:
 * - ar: Arabic
 * - he: Hebrew
 * - fa: Persian (Farsi)
 * - ur: Urdu
 */
export const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

/**
 * Extended list of RTL locales including regional variants
 */
export const RTL_LOCALES_EXTENDED = [
  'ar',      // Arabic (general)
  'ar-SA',   // Arabic (Saudi Arabia)
  'ar-AE',   // Arabic (UAE)
  'ar-EG',   // Arabic (Egypt)
  'ar-IQ',   // Arabic (Iraq)
  'ar-JO',   // Arabic (Jordan)
  'ar-KW',   // Arabic (Kuwait)
  'ar-LB',   // Arabic (Lebanon)
  'ar-LY',   // Arabic (Libya)
  'ar-MA',   // Arabic (Morocco)
  'ar-OM',   // Arabic (Oman)
  'ar-QA',   // Arabic (Qatar)
  'ar-SY',   // Arabic (Syria)
  'ar-TN',   // Arabic (Tunisia)
  'ar-YE',   // Arabic (Yemen)
  'he',      // Hebrew
  'he-IL',   // Hebrew (Israel)
  'fa',      // Persian/Farsi
  'fa-IR',   // Persian (Iran)
  'fa-AF',   // Persian/Dari (Afghanistan)
  'ur',      // Urdu
  'ur-PK',   // Urdu (Pakistan)
  'ur-IN',   // Urdu (India)
  'ps',      // Pashto
  'ps-AF',   // Pashto (Afghanistan)
  'ku',      // Kurdish
  'ku-IQ',   // Kurdish (Iraq)
  'ku-IR',   // Kurdish (Iran)
  'sd',      // Sindhi
  'sd-PK',   // Sindhi (Pakistan)
  'sd-IN',   // Sindhi (India)
  'ug',      // Uyghur
  'ug-CN',   // Uyghur (China)
  'dv',      // Divehi/Maldivian
  'dv-MV',   // Divehi (Maldives)
];

/**
 * Checks if a given locale is RTL (Right-to-Left)
 * 
 * @param locale - The locale code to check (e.g., 'ar', 'he', 'en')
 * @returns boolean - True if the locale is RTL, false otherwise
 * 
 * @example
 * isRTL('ar') // returns true
 * isRTL('he') // returns true
 * isRTL('en') // returns false
 * isRTL('es') // returns false
 */
export function isRTL(locale: string): boolean {
  if (!locale) return false;
  
  // Normalize locale to lowercase for comparison
  const normalizedLocale = locale.toLowerCase();
  
  // Check exact match first
  if (RTL_LOCALES.includes(normalizedLocale)) {
    return true;
  }
  
  // Check base locale (e.g., 'ar-SA' -> 'ar')
  const baseLocale = normalizedLocale.split('-')[0];
  return RTL_LOCALES.includes(baseLocale);
}

/**
 * Checks if a given locale is RTL using the extended list
 * This includes regional variants
 * 
 * @param locale - The locale code to check
 * @returns boolean - True if the locale is RTL, false otherwise
 */
export function isRTLExtended(locale: string): boolean {
  if (!locale) return false;
  
  const normalizedLocale = locale.toLowerCase();
  
  if (RTL_LOCALES_EXTENDED.includes(normalizedLocale)) {
    return true;
  }
  
  const baseLocale = normalizedLocale.split('-')[0];
  return RTL_LOCALES.includes(baseLocale);
}

/**
 * Returns the appropriate text direction for a locale
 * 
 * @param locale - The locale code
 * @returns 'rtl' | 'ltr' - The text direction
 * 
 * @example
 * getTextDirection('ar') // returns 'rtl'
 * getTextDirection('en') // returns 'ltr'
 */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Returns the HTML dir attribute value for a locale
 * 
 * @param locale - The locale code
 * @returns 'rtl' | 'ltr' - The dir attribute value
 */
export function getDirAttribute(locale: string): 'rtl' | 'ltr' {
  return getTextDirection(locale);
}

/**
 * Returns the HTML lang attribute value with proper formatting
 * 
 * @param locale - The locale code
 * @returns string - Properly formatted lang attribute
 * 
 * @example
 * getLangAttribute('ar') // returns 'ar'
 * getLangAttribute('ar-SA') // returns 'ar-SA'
 */
export function getLangAttribute(locale: string): string {
  return locale || 'en';
}

/**
 * RTL-aware CSS class helper
 * Returns a class name based on the locale direction
 * 
 * @param locale - The locale code
 * @param rtlClass - Class to apply for RTL locales
 * @param ltrClass - Class to apply for LTR locales (optional)
 * @returns string - The appropriate class name
 * 
 * @example
 * getDirectionalClass('ar', 'text-right', 'text-left') // returns 'text-right'
 * getDirectionalClass('en', 'text-right', 'text-left') // returns 'text-left'
 */
export function getDirectionalClass(
  locale: string,
  rtlClass: string,
  ltrClass?: string
): string {
  return isRTL(locale) ? rtlClass : (ltrClass ?? '');
}

/**
 * Utility to flip CSS logical properties based on direction
 * Useful for margins, paddings, and positioning
 * 
 * @param locale - The locale code
 * @param startValue - Value for start (logical property)
 * @param endValue - Value for end (logical property)
 * @returns Object with flipped values
 */
export function getLogicalProperties(
  locale: string,
  startValue: string | number,
  endValue: string | number
): { start: string | number; end: string | number } {
  // In RTL, start is right and end is left
  // In LTR, start is left and end is right
  return {
    start: startValue,
    end: endValue,
  };
}

/**
 * Hook-ready function to determine if current locale needs RTL layout
 * This can be used in React components
 * 
 * @param locale - The current locale string
 * @returns Object with RTL-related utilities
 */
export function useRTLUtils(locale: string) {
  const rtl = isRTL(locale);
  const dir = getTextDirection(locale);
  
  return {
    isRTL: rtl,
    isLTR: !rtl,
    dir,
    lang: getLangAttribute(locale),
    // Tailwind RTL class helpers
    start: rtl ? 'right' : 'left',
    end: rtl ? 'left' : 'right',
    // Margin/padding logical properties
    ms: 'ms-', // margin-start (logical)
    me: 'me-', // margin-end (logical)
    ps: 'ps-', // padding-start (logical)
    pe: 'pe-', // padding-end (logical)
  };
}
