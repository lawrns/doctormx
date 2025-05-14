# DoctorMX - Guía de Implementación de la Nueva Página de Inicio

Esta guía detalla la implementación de la nueva y mejorada página de inicio para DoctorMX, diseñada para ofrecer una experiencia moderna y atractiva que refleje la marca y servicios.

## Descripción General

La nueva página de inicio ha sido implementada siguiendo un enfoque modular con componentes reutilizables, una paleta de colores de marca específica, y animaciones suaves para crear una experiencia de usuario atractiva y accesible.

## Estructura de Archivos

- `/tailwind.config.js` - Configuración actualizada de Tailwind con los colores de la marca
- `/public/mascot.svg` - Mascota de la marca (Dr. Cóatl)
- `/src/components/ui/` - Componentes de UI reutilizables
  - `Button.tsx` - Componente de botón personalizado
  - `Card.tsx` - Sistema de tarjetas para características y contenido
  - `Container.tsx` - Contenedor para alinear contenido
  - `index.ts` - Exporta todos los componentes de UI
- `/src/pages/HomePage.tsx` - El componente principal de la página de inicio

## Paleta de Colores

Se han implementado los siguientes colores de marca:

- **brand-jade-500**: `#26A69A` (primario, usado en botones y acentos)
- **brand-jade-50**: `#E9F5F4` (inicio del gradiente del hero)
- **brand-sky-600**: `#0284C7` (enlaces e iconos destacados)
- **brand-sun-500**: `#FFB300` (CTAs secundarios)
- **brand-charcoal**: `#263238` (texto base)
- **brand-night**: `#0D1A24` (fondo en tema oscuro)

## Componentes Principales

### 1. Barra de Navegación

- Navegación sticky con logo, enlaces y botón CTA
- Transición suave con desvanecimiento para cada elemento
- Soporte para navegación móvil

### 2. Sección Hero

- Gradiente de fondo sutil (jade-50 a blanco)
- Animación de entrada para título y texto
- Botones CTA primario y secundario
- Mascota animada con fondo pulsante

### 3. Sección de Características

- Cuatro tarjetas de características en una cuadrícula responsiva
- Animación de "fade-up" al desplazarse a esta sección
- Iconos SVG personalizados

### 4. Sección de Patrocinadores

- Logotipos de patrocinadores con efecto de opacidad y escala al pasar el cursor
- Fondo con gradiente sutil

### 5. Sección de Planes

- Encabezado centrado y llamada a la acción
- Animación de entrada al estar en el viewport

### 6. Sección CTA

- Fondo con gradiente de marca
- Botón destacado para conversión

### 7. Pie de Página

- Diseño de 3 columnas con información de contacto y enlaces
- Diseño responsive que apila en móvil

## Animaciones

Se utilizan animaciones con Framer Motion:

- **Navegación**: Desvanecimiento escalonado de elementos
- **Hero**: Animación de deslizamiento y desvanecimiento para texto, animación de entrada tipo spring para la mascota
- **Tarjetas**: Animación de entrada al desplazarse a la vista
- **Respeto por preferencias de usuario**: Se desactivan animaciones de movimiento si el usuario tiene habilitado "prefers-reduced-motion"

## Responsividad

El diseño es mobile-first con puntos de quiebre en:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Características responsivas:
- Apilamiento de columnas en móvil
- Ajustes de espaciado y tamaño de fuente
- Menú colapsable en móvil
- Ajustes en el tamaño de las tarjetas

## Accesibilidad

Se han implementado varias mejoras de accesibilidad:
- Enlace "Skip to content" para usuarios de teclado
- Relaciones de contraste adecuadas para texto
- Áreas de toque adecuadas (min 44x44px)
- Respeto por preferencias de animación reducida
- Jerarquía de encabezados adecuada

## Dependencias

- **framer-motion**: Para animaciones
- **react-router-dom**: Para navegación (enlaces)
- **tailwindcss**: Para estilos

## Instalación y Uso

1. Asegúrese de tener instaladas las dependencias:
   ```bash
   npm install framer-motion
   ```

2. Si aún no lo tiene, importe las fuentes en el archivo principal CSS:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;800&family=Inter:wght@400;500&display=swap');
   ```

3. Para usar la página:
   ```jsx
   import HomePage from './pages/HomePage';
   
   // En su router
   <Route path="/" element={<HomePage />} />
   ```

## Personalización

### Modificar Colores

Para cambiar los colores, edite el archivo `tailwind.config.js`:

```js
// Ejemplo: Cambiar el color primario
"brand-jade-500": "#00897B", // Nuevo color primario
```

### Añadir Nuevas Secciones

Para añadir una nueva sección, siga este patrón:

```jsx
<section className="py-16 md:py-20 bg-white">
  <Container>
    <h2 className="text-3xl md:text-4xl font-heading font-bold">Título de Sección</h2>
    <p className="text-gray-600">Descripción de la sección</p>
    
    {/* Contenido de la sección */}
    
  </Container>
</section>
```

## Consejos para Mantenimiento

1. Mantenga la consistencia visual usando los tokens de color definidos
2. Utilice los componentes de UI existentes para mantener coherencia
3. Respete la jerarquía de encabezados para SEO y accesibilidad
4. Mantenga animaciones sutiles y respete preferencias de usuario
5. Evalúe rendimiento con Lighthouse periódicamente

## Solución de Problemas

### Problemas con Animaciones

Si las animaciones no funcionan correctamente:
- Verifique que framer-motion esté instalado
- Compruebe que no hay errores en la consola
- Asegúrese de que los estados iniciales y animados están definidos correctamente

### Problemas de Estilos

Si los estilos no se aplican:
- Confirme que los nombres de clase son correctos
- Verifique que tailwind.config.js tiene la configuración correcta
- Reinicie el servidor de desarrollo

## Nota sobre Rendimiento

Para mejorar el rendimiento:
- Las imágenes deben estar optimizadas
- Considere cargar la mascota SVG con React Suspense o lazy loading
- Utilice `whileInView` con `once: true` para evitar repetir animaciones

---

Implementado por:  
Equipo de Desarrollo DoctorMX