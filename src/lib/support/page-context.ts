import type { SupportAudience, SupportLink, SupportPageContext, SupportRouteType } from './types'

function buildLinks(links: Array<[label: string, href: string]>): SupportLink[] {
  return links.map(([label, href]) => ({ label, href }))
}

export function getSupportPageContext(pathname: string, audience: SupportAudience): SupportPageContext {
  const normalizedPath = pathname?.trim() || '/'

  if (normalizedPath === '/') {
    return {
      pathname: normalizedPath,
      routeType: 'landing',
      audience,
      pageTitle: 'Inicio de Doctor.mx',
      pageSummary: 'Página principal de Doctor.mx con propuesta de valor, confianza clínica, acceso a doctores y entrada a registro o inicio de sesión.',
      knownActions: [
        'Entender qué es Doctor.mx',
        'Buscar doctores',
        'Iniciar sesión',
        'Crear cuenta',
      ],
      suggestedLinks: buildLinks([
        ['Buscar doctores', '/doctors'],
        ['Especialidades', '/specialties'],
        ['Para doctores', '/for-doctors'],
        ['Iniciar sesión', '/auth/login'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/doctors')) {
    return {
      pathname: normalizedPath,
      routeType: 'doctor-directory',
      audience,
      pageTitle: 'Directorio de doctores',
      pageSummary: 'Catálogo de doctores para encontrar especialistas, revisar perfiles y avanzar hacia una cita.',
      knownActions: [
        'Buscar por especialidad',
        'Filtrar doctores',
        'Comparar perfiles',
        'Iniciar el flujo de reserva',
      ],
      suggestedLinks: buildLinks([
        ['Ver especialidades', '/specialties'],
        ['Buscar doctores', '/doctors'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/specialties')) {
    return {
      pathname: normalizedPath,
      routeType: 'specialties',
      audience,
      pageTitle: 'Especialidades médicas',
      pageSummary: 'Exploración de especialidades para orientar al usuario sobre qué tipo de doctor necesita.',
      knownActions: [
        'Explorar especialidades',
        'Elegir el tipo de consulta',
        'Ir al directorio de doctores',
      ],
      suggestedLinks: buildLinks([
        ['Ir al directorio', '/doctors'],
        ['Página principal', '/'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/for-doctors')) {
    return {
      pathname: normalizedPath,
      routeType: 'for-doctors',
      audience,
      pageTitle: 'Portal para doctores',
      pageSummary: 'Información para captar doctores, explicar beneficios de la plataforma y orientar al onboarding médico.',
      knownActions: [
        'Conocer beneficios para doctores',
        'Iniciar registro',
        'Ir al portal médico',
      ],
      suggestedLinks: buildLinks([
        ['Unirme como doctor', '/auth/register'],
        ['Portal doctor', '/doctor'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/help')) {
    return {
      pathname: normalizedPath,
      routeType: 'help',
      audience,
      pageTitle: 'Centro de ayuda',
      pageSummary: 'Ruta de ayuda general para resolver dudas frecuentes de pacientes y doctores.',
      knownActions: [
        'Resolver dudas frecuentes',
        'Encontrar soporte',
      ],
      suggestedLinks: buildLinks([
        ['Contacto', '/contact'],
        ['Privacidad', '/privacy'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/contact')) {
    return {
      pathname: normalizedPath,
      routeType: 'contact',
      audience,
      pageTitle: 'Contacto',
      pageSummary: 'Canal público de contacto para soporte general y seguimiento.',
      knownActions: [
        'Contactar soporte',
        'Resolver dudas generales',
      ],
      suggestedLinks: buildLinks([
        ['Centro de ayuda', '/help'],
        ['Inicio', '/'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/privacy') || normalizedPath.startsWith('/terms')) {
    return {
      pathname: normalizedPath,
      routeType: 'legal',
      audience,
      pageTitle: 'Información legal',
      pageSummary: 'Documentos de privacidad y términos del servicio de Doctor.mx.',
      knownActions: [
        'Consultar políticas',
        'Entender privacidad y términos',
      ],
      suggestedLinks: buildLinks([
        ['Privacidad', '/privacy'],
        ['Términos', '/terms'],
        ['Contacto', '/contact'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/ai-consulta')) {
    return {
      pathname: normalizedPath,
      routeType: 'ai-consult',
      audience,
      pageTitle: 'AI Consulta',
      pageSummary: 'Flujo de consulta guiada por IA para orientar al usuario y recopilar información antes de un análisis médico estructurado.',
      knownActions: [
        'Iniciar consulta con IA',
        'Entender cómo funciona el análisis',
        'Saber cuándo usar este flujo',
      ],
      suggestedLinks: buildLinks([
        ['Buscar doctores', '/doctors'],
        ['Mi cuenta', '/app'],
      ]),
    }
  }

  if (normalizedPath === '/app' || normalizedPath.startsWith('/app?')) {
    return {
      pathname: normalizedPath,
      routeType: 'patient-dashboard',
      audience,
      pageTitle: 'Panel del paciente',
      pageSummary: 'Área principal del paciente para revisar citas, historial y accesos a funciones de salud digital.',
      knownActions: [
        'Ver citas',
        'Revisar historial',
        'Ir a chat',
      ],
      suggestedLinks: buildLinks([
        ['Mis citas', '/app/appointments'],
        ['Mensajes', '/app/chat'],
        ['Segunda opinión', '/app/second-opinion'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/app/chat')) {
    return {
      pathname: normalizedPath,
      routeType: 'patient-chat',
      audience,
      pageTitle: 'Mensajes del paciente',
      pageSummary: 'Espacio de mensajería del paciente para conversar con doctores.',
      knownActions: [
        'Abrir conversaciones',
        'Enviar mensajes',
        'Retomar comunicación con un doctor',
      ],
      suggestedLinks: buildLinks([
        ['Mis citas', '/app/appointments'],
        ['Mi panel', '/app'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/app/appointments')) {
    return {
      pathname: normalizedPath,
      routeType: 'patient-appointments',
      audience,
      pageTitle: 'Citas del paciente',
      pageSummary: 'Vista de citas del paciente para revisar próximas consultas y seguimiento.',
      knownActions: [
        'Revisar próximas citas',
        'Entrar a una consulta',
        'Dar seguimiento',
      ],
      suggestedLinks: buildLinks([
        ['Mensajes', '/app/chat'],
        ['Buscar doctores', '/doctors'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/app/second-opinion')) {
    return {
      pathname: normalizedPath,
      routeType: 'patient-second-opinion',
      audience,
      pageTitle: 'Segunda opinión',
      pageSummary: 'Flujo para solicitar una segunda opinión médica y subir información relevante.',
      knownActions: [
        'Solicitar segunda opinión',
        'Subir documentos',
        'Dar seguimiento al caso',
      ],
      suggestedLinks: buildLinks([
        ['Mi panel', '/app'],
        ['Buscar doctores', '/doctors'],
      ]),
    }
  }

  if (normalizedPath === '/doctor' || normalizedPath.startsWith('/doctor?')) {
    return {
      pathname: normalizedPath,
      routeType: 'doctor-dashboard',
      audience,
      pageTitle: 'Panel del doctor',
      pageSummary: 'Espacio principal del doctor para operación clínica y de negocio dentro de Doctor.mx.',
      knownActions: [
        'Revisar agenda',
        'Ver analítica',
        'Entrar a mensajes',
      ],
      suggestedLinks: buildLinks([
        ['Mensajes', '/doctor/chat'],
        ['Disponibilidad', '/doctor/availability'],
        ['Analítica', '/doctor/analytics'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/doctor/chat')) {
    return {
      pathname: normalizedPath,
      routeType: 'doctor-chat',
      audience,
      pageTitle: 'Mensajes del doctor',
      pageSummary: 'Espacio de mensajería del doctor para conversar con pacientes.',
      knownActions: [
        'Revisar conversaciones',
        'Responder pacientes',
        'Retomar seguimiento',
      ],
      suggestedLinks: buildLinks([
        ['Disponibilidad', '/doctor/availability'],
        ['Panel doctor', '/doctor'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/doctor/availability')) {
    return {
      pathname: normalizedPath,
      routeType: 'doctor-availability',
      audience,
      pageTitle: 'Disponibilidad del doctor',
      pageSummary: 'Gestión de horarios y disponibilidad del doctor.',
      knownActions: [
        'Actualizar horarios',
        'Revisar disponibilidad',
      ],
      suggestedLinks: buildLinks([
        ['Panel doctor', '/doctor'],
        ['Mensajes', '/doctor/chat'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/doctor/analytics') || normalizedPath.startsWith('/doctor/analytics-ai')) {
    return {
      pathname: normalizedPath,
      routeType: 'doctor-analytics',
      audience,
      pageTitle: 'Analítica del doctor',
      pageSummary: 'Vista de rendimiento, actividad y resultados operativos del doctor.',
      knownActions: [
        'Revisar métricas',
        'Entender rendimiento',
      ],
      suggestedLinks: buildLinks([
        ['Finanzas', '/doctor/finances'],
        ['Panel doctor', '/doctor'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/doctor/finances')) {
    return {
      pathname: normalizedPath,
      routeType: 'doctor-finances',
      audience,
      pageTitle: 'Finanzas del doctor',
      pageSummary: 'Panel financiero del doctor para ingresos, pagos y seguimiento económico.',
      knownActions: [
        'Revisar ingresos',
        'Entender cobros',
      ],
      suggestedLinks: buildLinks([
        ['Analítica', '/doctor/analytics'],
        ['Panel doctor', '/doctor'],
      ]),
    }
  }

  if (normalizedPath.startsWith('/doctor/onboarding')) {
    return {
      pathname: normalizedPath,
      routeType: 'doctor-onboarding',
      audience,
      pageTitle: 'Onboarding del doctor',
      pageSummary: 'Proceso de incorporación y configuración inicial para doctores.',
      knownActions: [
        'Completar perfil',
        'Verificar documentos',
        'Avanzar onboarding',
      ],
      suggestedLinks: buildLinks([
        ['Portal doctor', '/doctor'],
        ['Para doctores', '/for-doctors'],
      ]),
    }
  }

  return {
    pathname: normalizedPath,
    routeType: 'unknown',
    audience,
    pageTitle: 'Página de Doctor.mx',
    pageSummary: 'Ruta no mapeada explícitamente. El asistente debe ayudar con navegación general y explicar Doctor.mx sin inventar detalles específicos.',
    knownActions: [
      'Orientar al usuario',
      'Explicar funciones generales',
      'Sugerir rutas principales',
    ],
    suggestedLinks: buildLinks([
      ['Inicio', '/'],
      ['Buscar doctores', '/doctors'],
      ['Centro de ayuda', '/help'],
    ]),
  }
}
