/**
 * @fileoverview Rule to detect hardcoded Spanish strings that should use i18n
 * @author DoctorMX ESLint Plugin
 */

'use strict';

/**
 * Palabras técnicas y términos que no deben ser detectados
 */
const DEFAULT_TECHNICAL_TERMS = [
  // Términos técnicos de programación
  'JSON', 'API', 'URL', 'URI', 'HTTP', 'HTTPS', 'HTML', 'CSS', 'JS', 'TS',
  'SQL', 'NoSQL', 'REST', 'GraphQL', 'SDK', 'CLI', 'UI', 'UX', 'DOM', 'CSV',
  'XML', 'YAML', 'JWT', 'OAuth', 'CORS', 'CSRF', 'XSS', 'SQL', 'ID', 'UUID',
  'PDF', 'PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'MP4', 'WebM', 'WebP',
  
  // Frameworks y librerías
  'React', 'Next.js', 'Node.js', 'Express', 'TypeScript', 'JavaScript',
  'Tailwind', 'Bootstrap', 'jQuery', 'Angular', 'Vue', 'Svelte',
  
  // Términos de base de datos
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase',
  
  // Plataformas y servicios
  'Stripe', 'Twilio', 'SendGrid', 'AWS', 'Azure', 'GCP', 'Vercel', 'Netlify',
  'Docker', 'Kubernetes', 'GitHub', 'GitLab', 'Git', 'NPM', 'Yarn', 'PNPM',
  
  // Formatos y protocolos
  'UTF-8', 'ASCII', 'Base64', 'SHA256', 'MD5', 'AES', 'RSA',
  
  // Medicina/Específicos (nombres propios de tecnologías médicas)
  'HL7', 'FHIR', 'DICOM', 'HIPAA', 'GDPR', 'LOINC', 'SNOMED', 'ICD-10',
  
  // Prefijos y sufijos comunes
  'ID', 'Id', 'IDs', 'URL', 'URLs', 'API', 'APIs',
  
  // Valores booleanos y null
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
  
  // Unidades de medida
  'px', 'em', 'rem', 'vh', 'vw', '%', 'ms', 's', 'kb', 'mb', 'gb', 'tb',
  'KB', 'MB', 'GB', 'TB', 'mm', 'cm', 'm', 'km', 'mg', 'g', 'kg', 'ml', 'l',
  
  // Zonas horarias
  'UTC', 'GMT', 'PST', 'EST', 'CST', 'MST',
  
  // Otros términos técnicos comunes
  'OAuth2', 'OpenID', 'SAML', 'LDAP', 'SMTP', 'IMAP', 'POP3', 'SSH', 'FTP',
  'SFTP', 'WebSocket', 'WebRTC', 'WebGL', 'WebAssembly', 'PWA', 'SPA',
  'SEO', 'SSR', 'SSG', 'CSR', 'ISR', 'CDN', 'DNS', 'SSL', 'TLS', 'SSH',
  'VPS', 'VM', 'OS', 'CPU', 'GPU', 'RAM', 'SSD', 'HDD', 'IP', 'IPv4', 'IPv6',
  'LAN', 'WAN', 'VPN', 'NAT', 'DHCP', 'ICMP', 'TCP', 'UDP',
  
  // Métodos HTTP
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD',
  
  // Códigos HTTP comunes
  '200', '201', '204', '301', '302', '400', '401', '403', '404', '500', '502', '503',
  
  // Roles de ARIA
  'button', 'link', 'heading', 'region', 'main', 'nav', 'aside', 'article',
  'dialog', 'alert', 'alertdialog', 'tab', 'tabpanel', 'menu', 'menubar',
  'menuitem', 'option', 'listbox', 'combobox', 'checkbox', 'radio', 'switch',
  'slider', 'spinbutton', 'progressbar', 'status', 'log', 'marquee', 'timer',
  'tooltip', 'tree', 'treeitem', 'tablist', 'toolbar', 'search', 'form',
  'textbox', 'searchbox', 'password', 'number', 'email', 'tel', 'url',
  
  // Tipos de input HTML
  'text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date',
  'datetime-local', 'month', 'week', 'time', 'color', 'file', 'hidden',
  'checkbox', 'radio', 'submit', 'reset', 'button', 'image',
  
  // Palabras clave de TypeScript/JavaScript
  'any', 'unknown', 'never', 'void', 'string', 'number', 'boolean', 'object',
  'symbol', 'bigint', 'interface', 'type', 'enum', 'namespace', 'module',
  'import', 'export', 'default', 'from', 'as', 'async', 'await', 'yield',
  'function', 'class', 'extends', 'implements', 'constructor', 'super',
  'this', 'self', 'window', 'document', 'console', 'process', 'global',
  'require', 'module', 'exports', 'Buffer', 'Array', 'Object', 'String',
  'Number', 'Boolean', 'Date', 'RegExp', 'Error', 'Promise', 'Map', 'Set',
  'WeakMap', 'WeakSet', 'Proxy', 'Reflect', 'JSON', 'Math', 'console',
  
  // Hooks de React
  'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback',
  'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue',
  'useId', 'useTransition', 'useDeferredValue', 'useSyncExternalStore',
  'useActionState', 'useOptimistic', 'useFormStatus'
];

/**
 * Palabras comunes en español que indican un string hardcodeado
 * Estas son palabras que definitivamente deben usar i18n
 */
const SPANISH_INDICATORS = [
  'iniciar sesión', 'cerrar sesión', 'crear cuenta', 'registrarse',
  'iniciar', 'cerrar', 'entrar', 'salir', 'acceder', 'acceso',
  'paciente', 'pacientes', 'doctor', 'doctores', 'médico', 'médicos',
  'cita', 'citas', 'consulta', 'consultas', 'agendar', 'reservar',
  'nombre', 'apellido', 'correo', 'email', 'teléfono', 'dirección',
  'guardar', 'cancelar', 'eliminar', 'editar', 'actualizar', 'crear',
  'enviar', 'buscar', 'filtrar', 'ordenar', 'seleccionar', 'elegir',
  'continuar', 'siguiente', 'anterior', 'atrás', 'volver',
  'confirmar', 'aceptar', 'rechazar', 'completar', 'finalizar',
  'cargando', 'procesando', 'espere', 'por favor',
  'error', 'éxito', 'advertencia', 'información', 'atención',
  'obligatorio', 'requerido', 'opcional',
  'fecha', 'hora', 'día', 'mes', 'año', 'hoy', 'mañana', 'ayer',
  'bienvenido', 'bienvenida', 'gracias', 'disculpe', 'lo siento',
  'no encontrado', 'no disponible', 'en mantenimiento',
  'configuración', 'perfil', 'ajustes', 'preferencias',
  'notificaciones', 'mensajes', 'alertas',
  'contraseña', 'usuario', 'cuenta', 'sesión',
  'precio', 'costo', 'pago', 'pagado', 'pendiente',
  'descripción', 'detalles', 'información', 'datos',
  'estado', 'activo', 'inactivo', 'pendiente', 'completado',
  'si', 'no', 'ok', 'cancelar', 'aceptar'
];

/**
 * Detecta si un string contiene caracteres españoles comunes
 */
function containsSpanishCharacters(str) {
  // Caracteres específicos del español
  const spanishChars = /[áéíóúüñÁÉÍÓÚÜÑ¿¡]/;
  return spanishChars.test(str);
}

/**
 * Detecta si un string parece ser español basado en palabras comunes
 */
function containsSpanishWords(str) {
  const lowerStr = str.toLowerCase();
  return SPANISH_INDICATORS.some(word => lowerStr.includes(word));
}

/**
 * Verifica si un string parece ser clases de Tailwind CSS
 */
function isTailwindClasses(str) {
  const trimmed = str.trim();
  
  // Patrones comunes de clases Tailwind
  const tailwindPatterns = [
    // Clases de tamaño/ancho/alto
    /\b(w-|h-|min-w-|min-h-|max-w-|max-h-)(\d+|screen|full|fit|auto|px|sm|md|lg|xl)/,
    // Padding/Margin
    /\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr)-\d+/,
    // Flex/Grid
    /\b(flex|grid|inline|block|hidden|contents)\b/,
    // Alineación
    /\b(items|justify|content|place)-(start|end|center|between|around|evenly|stretch)/,
    // Espaciado
    /\b(gap|gap-x|gap-y|space-x|space-y)-\d+/,
    // Posicionamiento
    /\b(static|fixed|absolute|relative|sticky)\b/,
    // Bordes
    /\b(border|rounded)(-[a-z]+)?-\d*/,
    // Colores de fondo/texto
    /\b(bg|text|border)-(transparent|current|white|black|gray|red|blue|green|yellow|purple|pink)-\d*/,
    // Hover/Focus states
    /\b(hover|focus|active|disabled|group-hover):/,
    // Responsive prefixes
    /\b(sm|md|lg|xl|2xl):/,
    // Transiciones
    /\b(transition|duration|ease|delay)-/,
    // Transform
    /\b(transform|scale|rotate|translate|skew)-/,
    // Shadow
    /\b(shadow|shadow-sm|shadow-md|shadow-lg|shadow-xl|shadow-none)/,
    // Layout
    /\b(container|mx-auto|box-|overflow-|object-)/,
    // Typography
    /\b(text-|font-|leading-|tracking-|whitespace-|break-)/,
    // Interactividad
    /\b(cursor-|pointer-events-|user-select-|resize)/
  ];
  
  // Si tiene al menos 3 patrones de Tailwind, probablemente sea clases CSS
  let matchCount = 0;
  for (const pattern of tailwindPatterns) {
    if (pattern.test(trimmed)) {
      matchCount++;
    }
    if (matchCount >= 3) {
      return true;
    }
  }
  
  // Si contiene muchas clases (espacios separando palabras con guiones)
  const classLikePatterns = trimmed.split(/\s+/).filter(word => 
    /^[a-z]+(-[a-z0-9]+)*$/i.test(word) && word.includes('-')
  );
  
  if (classLikePatterns.length >= 4) {
    return true;
  }
  
  return false;
}

/**
 * Verifica si un string es técnicamente válido (no debe ser traducido)
 */
function isTechnicalTerm(str, ignoredWords = []) {
  const trimmed = str.trim();
  
  // Lista combinada de términos técnicos y palabras ignoradas
  const allTechnicalTerms = [...DEFAULT_TECHNICAL_TERMS, ...ignoredWords];
  
  // Verificar coincidencia exacta (case insensitive)
  if (allTechnicalTerms.some(term => term.toLowerCase() === trimmed.toLowerCase())) {
    return true;
  }
  
  // Verificar si es solo símbolos, números o puntuación
  if (/^[\d\s\W_]+$/.test(trimmed)) {
    return true;
  }
  
  // Verificar si es un identificador (camelCase, snake_case, kebab-case)
  if (/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(trimmed) && trimmed.length < 50) {
    return true;
  }
  
  // Verificar si es una ruta de archivo
  if (/^[./\\]/.test(trimmed) || /\.(js|ts|tsx|jsx|json|css|scss|html|svg|png|jpg)$/.test(trimmed)) {
    return true;
  }
  
  // Verificar si es un selector CSS
  if (/^[.#[]/.test(trimmed)) {
    return true;
  }
  
  // Verificar si son clases de Tailwind
  if (isTailwindClasses(trimmed)) {
    return true;
  }
  
  return false;
}

/**
 * Verifica si el nodo está en un contexto que debe ignorarse
 */
function shouldIgnoreContext(node, context) {
  // Obtener ancestors usando la API moderna de ESLint
  const sourceCode = context.sourceCode || context.getSourceCode();
  const ancestors = sourceCode.getAncestors ? sourceCode.getAncestors(node) : (context.getAncestors ? context.getAncestors() : []);
  
  // Ignorar dentro de console.*
  if (ancestors.some(ancestor => 
    ancestor.type === 'CallExpression' &&
    ancestor.callee &&
    ancestor.callee.type === 'MemberExpression' &&
    ancestor.callee.object &&
    ancestor.callee.object.name === 'console'
  )) {
    return true;
  }
  
  // Ignorar keys de objetos (Property con key siendo el string)
  if (ancestors.length > 0) {
    const parent = ancestors[ancestors.length - 1];
    if (parent.type === 'Property' && parent.key === node) {
      return true;
    }
  }
  
  // Ignorar en imports/exports
  if (ancestors.some(ancestor => 
    ancestor.type === 'ImportDeclaration' ||
    ancestor.type === 'ExportNamedDeclaration' ||
    ancestor.type === 'ExportAllDeclaration'
  )) {
    return true;
  }
  
  // Ignorar en comentarios (JSDoc, etc.)
  // Esto se maneja a nivel de fuente, los strings en comentarios no son Literals
  
  // Ignorar en llamadas a t() o translate()
  if (ancestors.some(ancestor =>
    ancestor.type === 'CallExpression' &&
    ancestor.callee &&
    (ancestor.callee.name === 't' || 
     ancestor.callee.name === 'translate' ||
     (ancestor.callee.property && 
      (ancestor.callee.property.name === 't' || ancestor.callee.property.name === 'translate')))
  )) {
    return true;
  }
  
  // Ignorar atributos de objeto que son keys (usado para mapeo)
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (ancestor.type === 'Property') {
      // Si estamos en la key de la propiedad
      if (ancestor.key === node || ancestor.key.range[0] === node.range[0]) {
        return true;
      }
      break;
    }
  }
  
  return false;
}

/**
 * Genera una sugerencia de key de i18n basada en el string
 */
function generateI18nKey(str) {
  const lowerStr = str.toLowerCase().trim();
  
  // Mapeo de strings comunes a keys
  const commonMappings = {
    'iniciar sesión': 'auth.login',
    'cerrar sesión': 'auth.logout',
    'crear cuenta': 'auth.register',
    'registrarse': 'auth.register',
    'iniciar': 'auth.login',
    'entrar': 'auth.login',
    'nombre': 'form.firstName',
    'apellido': 'form.lastName',
    'correo electrónico': 'form.email',
    'email': 'form.email',
    'contraseña': 'form.password',
    'guardar': 'actions.save',
    'cancelar': 'actions.cancel',
    'eliminar': 'actions.delete',
    'editar': 'actions.edit',
    'enviar': 'actions.send',
    'buscar': 'actions.search',
    'cargando': 'common.loading',
    'error': 'common.error',
    'éxito': 'common.success',
    'aceptar': 'actions.accept',
    'continuar': 'actions.continue',
    'volver': 'actions.back',
    'siguiente': 'actions.next',
    'anterior': 'actions.previous',
    'paciente': 'entities.patient',
    'doctor': 'entities.doctor',
    'cita': 'entities.appointment',
    'consulta': 'entities.consultation'
  };
  
  if (commonMappings[lowerStr]) {
    return commonMappings[lowerStr];
  }
  
  // Generar key genérica basada en el contenido
  const normalized = str
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.');
  
  return `i18n.${normalized}`;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded Spanish strings - use i18n t() instead',
      category: 'Internationalization',
      recommended: true,
      url: 'https://github.com/doctormx/doctormx/blob/main/docs/i18n/ESLINT_RULE.md'
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          ignoredWords: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional words to ignore (technical terms, proper nouns)'
          },
          minLength: {
            type: 'number',
            default: 3,
            description: 'Minimum string length to check'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noHardcodedSpanish: 
        'Hardcoded Spanish string detected: "{{string}}". Use i18n t("{{suggestedKey}}") instead.',
      suggestI18n: 'Replace with t("{{key}}")'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const ignoredWords = options.ignoredWords || [];
    const minLength = options.minLength || 3;
    
    /**
     * Verifica un string literal
     */
    function checkStringLiteral(node) {
      const value = node.value;
      
      // Ignorar strings vacíos o muy cortos
      if (!value || typeof value !== 'string') {
        return;
      }
      
      const trimmed = value.trim();
      if (trimmed.length < minLength) {
        return;
      }
      
      // Verificar si debe ignorarse por contexto
      if (shouldIgnoreContext(node, context)) {
        return;
      }
      
      // Verificar si es un término técnico
      if (isTechnicalTerm(trimmed, ignoredWords)) {
        return;
      }
      
      // Verificar si contiene caracteres o palabras en español
      const hasSpanishChars = containsSpanishCharacters(trimmed);
      const hasSpanishWords = containsSpanishWords(trimmed);
      
      // Si no tiene indicios de español, no reportar
      if (!hasSpanishChars && !hasSpanishWords) {
        return;
      }
      
      // Generar sugerencia de key
      const suggestedKey = generateI18nKey(trimmed);
      
      context.report({
        node,
        messageId: 'noHardcodedSpanish',
        data: {
          string: trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed,
          suggestedKey
        },
        suggest: [
          {
            messageId: 'suggestI18n',
            data: { key: suggestedKey },
            fix(fixer) {
              // Solo auto-fixear si es un string simple sin interpolación
              if (trimmed === value) {
                return fixer.replaceText(node, `t('${suggestedKey}')`);
              }
              return null;
            }
          }
        ]
      });
    }

    /**
     * Verifica texto en JSX
     */
    function checkJSXText(node) {
      const value = node.value;
      
      if (!value || typeof value !== 'string') {
        return;
      }
      
      const trimmed = value.trim();
      if (trimmed.length < minLength) {
        return;
      }
      
      // Ignorar solo espacios en blanco o newlines
      if (/^[\s\n\r]*$/.test(trimmed)) {
        return;
      }
      
      // Verificar si es un término técnico
      if (isTechnicalTerm(trimmed, ignoredWords)) {
        return;
      }
      
      // Verificar si contiene caracteres o palabras en español
      const hasSpanishChars = containsSpanishCharacters(trimmed);
      const hasSpanishWords = containsSpanishWords(trimmed);
      
      if (!hasSpanishChars && !hasSpanishWords) {
        return;
      }
      
      const suggestedKey = generateI18nKey(trimmed);
      
      context.report({
        node,
        messageId: 'noHardcodedSpanish',
        data: {
          string: trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed,
          suggestedKey
        },
        suggest: [
          {
            messageId: 'suggestI18n',
            data: { key: suggestedKey },
            fix(fixer) {
              return fixer.replaceText(node, `{t('${suggestedKey}')}`);
            }
          }
        ]
      });
    }

    /**
     * Verifica atributos JSX
     */
    function checkJSXAttribute(node) {
      // Solo verificar atributos que son strings literales
      if (!node.value || node.value.type !== 'Literal') {
        return;
      }
      
      // Ignorar atributos específicos que son técnicos
      const attrName = node.name.name;
      const technicalAttributes = [
        'id', 'name', 'htmlFor', 'className', 'style', 'href', 'src', 
        'alt', 'title', 'type', 'role', 'aria-label', 'aria-describedby',
        'data-testid', 'data-cy', 'key', 'ref', 'onClick', 'onChange',
        'onSubmit', 'onBlur', 'onFocus', 'placeholder', // placeholder se verifica
        'target', 'rel', 'method', 'action', 'encType', 'autoComplete',
        'maxLength', 'minLength', 'pattern', 'step', 'min', 'max'
      ];
      
      // Algunos atributos técnicos pueden tener valores en español que deben traducirse
      const shouldTranslateAttributes = ['placeholder', 'title', 'alt', 'aria-label'];
      
      if (technicalAttributes.includes(attrName) && !shouldTranslateAttributes.includes(attrName)) {
        return;
      }
      
      checkStringLiteral(node.value);
    }

    return {
      Literal(node) {
        // Solo verificar strings, no números ni otros literales
        if (typeof node.value === 'string') {
          checkStringLiteral(node);
        }
      },
      JSXText(node) {
        checkJSXText(node);
      },
      JSXAttribute(node) {
        checkJSXAttribute(node);
      }
    };
  }
};
