/**
 * Comprehensive shim for date-fns core functionality
 */

// Formatting functions
export function format(date, formatStr, options = {}) {
  const d = new Date(date);
  
  // Basic formatting patterns
  if (formatStr === 'EEEE') {
    const days = options.locale?.code === 'es' 
      ? ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[d.getDay()];
  }
  
  if (formatStr === 'EEE') {
    const days = options.locale?.code === 'es'
      ? ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
  }
  
  if (formatStr === 'd') {
    return d.getDate().toString();
  }
  
  if (formatStr === 'dd MMMM yyyy') {
    const day = d.getDate().toString().padStart(2, '0');
    const months = options.locale?.code === 'es'
      ? ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }
  
  // Default format
  return d.toLocaleDateString();
}

// Date manipulation functions
export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date, amount) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function addYears(date, amount) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + amount);
  return result;
}

export function subDays(date, amount) {
  return addDays(date, -amount);
}

export function subMonths(date, amount) {
  return addMonths(date, -amount);
}

export function subYears(date, amount) {
  return addYears(date, -amount);
}

// Date comparison functions
export function isAfter(date, dateToCompare) {
  return new Date(date) > new Date(dateToCompare);
}

export function isBefore(date, dateToCompare) {
  return new Date(date) < new Date(dateToCompare);
}

export function isEqual(date, dateToCompare) {
  return new Date(date).getTime() === new Date(dateToCompare).getTime();
}

export function isSameDay(date, dateToCompare) {
  const d1 = new Date(date);
  const d2 = new Date(dateToCompare);
  return d1.getDate() === d2.getDate() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getFullYear() === d2.getFullYear();
}

// Export a default object with all functions
export default {
  format,
  addDays,
  addMonths,
  addYears,
  subDays,
  subMonths,
  subYears,
  isAfter,
  isBefore,
  isEqual,
  isSameDay
};
