import { format, formatDistance, isToday, isYesterday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format a date to a human-readable string
 * @param date Date to format
 * @param includeYear Whether to include the year in the formatted string
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, includeYear = true): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return 'Hoy';
  }
  
  if (isYesterday(dateObj)) {
    return 'Ayer';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Mañana';
  }
  
  return format(dateObj, includeYear ? 'EEEE d MMMM yyyy' : 'EEEE d MMMM', { locale: es });
};

/**
 * Format a time to a human-readable string
 * @param date Date or time string to format
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return format(dateObj, 'HH:mm', { locale: es });
};

/**
 * Format a date and time to a human-readable string
 * @param date Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return `${formatDate(dateObj)} a las ${formatTime(dateObj)}`;
};

/**
 * Format a date range to a human-readable string
 * @param startDate Start date
 * @param endDate End date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isSameDay(start, end)) {
    return `${formatDate(start)}, ${formatTime(start)} - ${formatTime(end)}`;
  }
  
  return `${formatDate(start)} - ${formatDate(end)}`;
};

/**
 * Check if two dates are the same day
 * @param date1 First date
 * @param date2 Second date
 * @returns Whether the dates are the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Format a relative time (e.g., "2 days ago")
 * @param date Date to format
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return formatDistance(dateObj, new Date(), { locale: es, addSuffix: true });
};

/**
 * Get the day name for a date
 * @param date Date to get the day name for
 * @returns Day name in Spanish
 */
export const getDayName = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return format(dateObj, 'EEEE', { locale: es });
};

/**
 * Get the month name for a date
 * @param date Date to get the month name for
 * @returns Month name in Spanish
 */
export const getMonthName = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return format(dateObj, 'MMMM', { locale: es });
};

/**
 * Format a date as MM/DD/YYYY
 * @param date Date to format
 * @returns Date in MM/DD/YYYY format
 */
export const formatSimpleDate = (date: string | Date): string => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return format(dateObj, 'dd/MM/yyyy', { locale: es });
};