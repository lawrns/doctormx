// Spanish translations for date formatting
const spanishDays = {
  'Monday': 'Lunes',
  'Tuesday': 'Martes',
  'Wednesday': 'Miércoles',
  'Thursday': 'Jueves',
  'Friday': 'Viernes',
  'Saturday': 'Sábado',
  'Sunday': 'Domingo',
  
  // Abbreviated versions
  'Mon': 'Lun',
  'Tue': 'Mar',
  'Wed': 'Mié',
  'Thu': 'Jue',
  'Fri': 'Vie',
  'Sat': 'Sáb',
  'Sun': 'Dom'
};

const spanishMonths = {
  'January': 'Enero',
  'February': 'Febrero',
  'March': 'Marzo',
  'April': 'Abril',
  'May': 'Mayo',
  'June': 'Junio',
  'July': 'Julio',
  'August': 'Agosto',
  'September': 'Septiembre',
  'October': 'Octubre',
  'November': 'Noviembre',
  'December': 'Diciembre'
};

// Import format and addDays from date-fns
import { format, addDays } from 'date-fns';

// Helper function to format dates in Spanish
export const formatSpanishDate = (date: Date, formatPattern: string): string => {
  // Get the English formatted date first
  let englishDate = format(date, formatPattern);
  
  // Replace English day and month names with Spanish equivalents
  Object.entries(spanishDays).forEach(([english, spanish]) => {
    englishDate = englishDate.replace(new RegExp(english, 'g'), spanish);
  });
  
  Object.entries(spanishMonths).forEach(([english, spanish]) => {
    englishDate = englishDate.replace(new RegExp(english, 'g'), spanish);
  });
  
  return englishDate;
};

export { format, addDays };