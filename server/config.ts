import dotenv from 'dotenv';

// Asegurar que dotenv esté configurado
dotenv.config();

export const config = {
  // Google Places API
  googleApiKey: process.env.GOOGLE_API_KEY || '',
  
  
  // Configuración de búsqueda
  showOnlyLocal: process.env.SHOW_ONLY_LOCAL === 'true',
  minResults: parseInt(process.env.MIN_RESULTS || '3'),
  defaultRadius: parseInt(process.env.DEFAULT_RADIUS || '5000'), // metros
  
  // Límites
  maxResults: 5,
  
  // Validación
  isGoogleConfigured: () => !!config.googleApiKey,
  
  // Especialidades válidas (mapeo español -> inglés para Google Places)
  specialtyMapping: {
    'médico general': 'general practitioner',
    'medicina general': 'general practitioner',
    'internista': 'internal medicine',
    'medicina interna': 'internal medicine',
    'cardiólogo': 'cardiologist',
    'cardiología': 'cardiology',
    'dermatólogo': 'dermatologist',
    'dermatología': 'dermatology',
    'ginecólogo': 'gynecologist',
    'ginecología': 'gynecology',
    'pediatra': 'pediatrician',
    'pediatría': 'pediatrics',
    'neurólogo': 'neurologist',
    'neurología': 'neurology',
    'psiquiatra': 'psychiatrist',
    'psiquiatría': 'psychiatry',
    'oftalmólogo': 'ophthalmologist',
    'oftalmología': 'ophthalmology',
    'otorrinolaringólogo': 'otolaryngologist',
    'otorrinolaringología': 'otolaryngology',
    'traumatólogo': 'orthopedist',
    'traumatología': 'orthopedics',
    'urólogo': 'urologist',
    'urología': 'urology',
    'endocrinólogo': 'endocrinologist',
    'endocrinología': 'endocrinology',
    'gastroenterólogo': 'gastroenterologist',
    'gastroenterología': 'gastroenterology',
    'neumólogo': 'pulmonologist',
    'neumología': 'pulmonology'
  }
};