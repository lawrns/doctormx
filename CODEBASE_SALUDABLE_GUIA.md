# DOCTOR.MX - GUÍA DE CONSTRUCCIÓN DE CODEBASE SALUDABLE
**Sesión de Asesoría con Claude**
**Fecha:** 2025-02-10
**Objetivo:** Documentar metodología para construir código saludable desde el inicio

---

## ÍNDICE DE PREGUNTAS Y RESPUESTAS

*(Este documento se irá actualizando con cada pregunta)*

**PREGUNTA #1:** Mi proceso actual y por qué siento que siempre termino refactorizando *(Sección 1)*

**PREGUNTA #2:** Cómo tú harías mis proyectos paso a paso si fueras yo *(Sección 2)*

**PREGUNTA #3:** Cómo agregar nuevas features asegurando UI/UX alineados, flujos lógicos y calidad visual *(Sección 3)*

**PREGUNTA #4:** Integra todo en una guía paso a paso completa *(Sección 7)*

**PREGUNTA #5:** ¿Qué más preguntarías en este momento? - 10 preguntas adicionales que yo me haría *(Sección 8)*

**PREGUNTA #6:** Guía práctica sintetizada paso a paso para seguir SIN dudar *(Sección 9)*

**PREGUNTA #7:** ¿Qué son los pendientes y cómo usar IA moderna (multi-agents, swarms) para potenciar el proceso? *(Sección 10)*

**PREGUNTA #8:** ¿Cuándo y cómo usar Deep Research (swarms, web search, GitHub analysis) sin caer en la trampa de investigar demasiado? *(Sección 11)*

---

## 📋 SECCIÓN 0: START HERE IF YOU'RE IN A HURRY

### ¿No tienes tiempo de leer 3600 líneas? Empieza aquí.

---

## 🚀 EL RESUMEN DE 2 MINUTOS:

```
TU PROBLEMA ACTUAL:
  → Das todo a la IA de golpe
  → Recibes código desordenado
  → Pasas la mitad del tiempo limpiando
  → Nunca terminas nada

LA SOLUCIÓN:
  → Una capa a la vez
  → Cada capa probada
  → Código limpio desde el inicio
  → Termina projects
```

---

## 📋 LOS 7 PASOS ESENCIALES:

```
PASO 1: Define el PROBLEMA (15 min)
   → Una frase clara
   → ¿Para quién? ¿Por qué urgente?

PASO 2: Dibuja el FLUJO (15 min)
   → Usuario → [Paso 1] → [Paso 2] → Fin
   → ¿Qué datos necesito?

PASO 3: Define el MÍNIMO viable (10 min)
   → SOLO lo crítico
   → El resto es "nice to have"

PASO 4: Inicia el proyecto (10 min)
   → Next.js + Supabase (o lo que sepas)
   → NO inventes, usa lo estándar

PASO 5: Construye UNA cosa (1-3 días)
   → SOLO esa cosa
   → PRUEBA que funcione
   → Estabilízala

PASO 6: Limpia (30 min cada 3 días)
   → Elimina lo que no usas
   → Une duplicados
   → Nombres claros

PASO 7: Repite para siguiente feature
   → SOLO cuando anterior está estable
```

---

## 🎯 CHECKLIST ANTES DE ESCRIBIR CÓDIGO:

```
☐ Puedo definir mi problema en 1 frase
☐ Sé quién es mi usuario
☐ Sé qué quiere hacer
☐ Dibujé el flujo básico
☐ Sé qué es MÍNIMO viable
☐ Sé qué NO haré aún
```

---

## 🔗 QUÉ LEER SEGÚN TU SITUACIÓN:

```
SI...                                  LEE...
├──────────────────────────────────────┼─────────────────────┤
│ Nunca has terminado un project        │ Sección 1 (Fundamentos)│
│ Siempre refactorizas mucho          │ Sección 2 (9 pasos)    │
│ No sabes por dónde empezar           │ Sección 9 (Práctica)   │
│ Tu UI/UX es desordenada              │ Sección 3 (Diseño)     │
│ No sabes qué feature hacer primero    │ Sección 8 (Pregunta 4) │
│ Quieres usar IA moderna              │ Sección 10 (Multi-Agent)│
│ Te atascas siempre                   │ Sección 11 (Deep Research)│
│ Quieres ejemplos rápidos             │ Cheatsheet.md          │
│ Quieres arrancar YA                 │ Quickstart.md           │
└──────────────────────────────────────┴─────────────────────┘
```

---

## 💡 LOS 5 ERRORES FATALES:

```
❌ ERROR 1: Investigar antes de saber qué buscar
   SOLUCIÓN: Define problema primero (Sección 1)

❌ ERROR 2: Dar TODO a la IA de golpe
   SOLUCIÓN: Prompts específicos (Sección 9)

❌ ERROR 3: Agregar TODO antes de probar
   SOLUCIÓN: Una capa a la vez (Sección 2)

❌ ERROR 4: Limpiar al final
   SOLUCIÓN: Limpieza constante (Sección 9)

❌ ERROR 5: Construir lo que NO es crítico
   SOLUCIÓN: MVP primero (Sección 1)
```

---

## ⚡ START RÁPIDO:

```
MINUTO 0-5:    Lee esta Sección 0
MINUTO 5-20:   Lee Sección 9 (Guía Práctica)
MINUTO 20-30:   Abre IDEA.md y escribe tu idea
MINUTO 30-40:   Abre FLUJO.md y dibuja el flujo
MINUTO 40-50:   Abre BACKLOG.md y define MVP
MINUTO 50-60:   Inicia proyecto: npx create-next-app
DÍA 1-5:       Sigue Guía Práctica paso a paso
```

---

## 📁 ARCHIVOS ADICIONALES:

```
📄 QUICKSTART.md       → Comandos exactos para copiar/pegar
📄 CHEATSHEET.md       → Prompts listos para usar YA
📄 README.md           → Resumen de 1 página de todo
```

---

## 🎯 SI SÓLO RECUERDAS UNA COSA:

> **"Construye LO MÍNIMO que funciona, pruébalo, estabilízalo, y solo AGREGA lo siguiente."**

---

*Fin de Sección 0 - Start Here*

---

## 📋 SECCIÓN 4: HERRAMIENTAS Y AUTOMACIÓN

### PENDIENTE - Herramientas y scripts para automatizar tu flujo de trabajo

*(Esta sección se completará cuando lo solicites)*

---

## 📋 SECCIÓN 5: MÉTRICAS Y MONITOREO

### PENDIENTE - Cómo medir el éxito de tu código y proyecto

*(Esta sección se completará cuando lo solicites)*

---

## 📋 SECCIÓN 6: PATRONES Y ANTI-PATRONES

### PENDIENTE - Patrones comunes y errores a evitar

*(Esta sección se completará cuando lo solicites)*

---

## 📋 SECCIÓN 1: FUNDAMENTOS

### PREGUNTA #1: Mi proceso actual y por qué siento que siempre termino refactorizando

**Tu proceso actual:**
1. Describo idea extensamente a un agente
2. Hago deep research para inspiración
3. Pregunta qué stack/diseño usar
4. Le doy todo a un agente de construcción
5. Terminar con código innecesario/obsoleto
6. Paso mucho tiempo limpiando/errors/refuerzo

---

### MI RESPUESTA BRUTALMENTE HONESTA:

**Tu problema NO eres tú. Es tu ENFOQUE.**

Piénsalo así: Tú eres el arquitecto, las IAs son los albañiles. ¿Qué pasaría si le dices a un equipo de albañiles "construyan algo bonito" sin planos, sin cimientos calculados, sin saber cuántos pisos necesita la casa?

**Te construirían cualquier cosa. Luego tendrías que demoler y reconstruir.**

---

## 🎯 LO QUE ESTÁ MAL EN TU PROCESO:

### 1. **La trampa de la investigación excesiva**
- Haces "deep research" antes de saber QUÉ necesitas investigar
- Es como comprar muebles para una casa que no has diseñado aún
- Resultado: Copias cosas que no necesitas, te falta lo que sí necesitas

### 2. **El problema de "darle todo a la IA"**
- Una IA no puede ver TODO el contexto de tu proyecto
- No sabe qué se conecta con qué
- No sabe qué será obsoleto en 2 meses
- Genera código que "funciona" pero no encaja bien

### 3. **El error fatal: Construir antes de planificar**
- Vas directo a código antes de tener un MAPA claro
- Es como construir un barco mientras está en el agua
- Por supuesto te toca refactorizar después

---

## ✅ CÓMO YO LO HARÍA SI FUERA TÚ:

### PASO 1: **Entiendo el problema profundamente** (1 día máximo)

Antes de hablar de código o stack, pregunto:
- ¿Qué problema REAL voy a resolver?
- ¿Para quién? ¿Qué dolor tienen?
- ¿Qué les pediría que HACEN con mi sistema?

Ejemplo: "Quiero un sistema de citas médicas" → MUY vago.

Mejor: "Quiero que pacientes encuentren doctores, agenden, paguen, y tengan videollamada. Tienen miedo de no encontrar buenos doctores."

---

### PASO 2: **Diseño SIMPLE en papel** (2 horas máximo)

**En papel o en un documento simple, dibujo:**

```
USUARIO entra → Ve lista de doctores → Elige uno → AGENDA → PAGA → Tiene cita
```

**Y me pregunto:**
- ¿Qué información NECESITO en cada paso?
- ¿Qué puede salir mal?
- ¿Qué es lo MÍNIMO viable para probar esto?

**NO pienso en:**
- Stack tecnológico (todavía)
- Diseño visual (todavía)
- Features "bonitas" (todavía)

---

### PASO 3: **Defino lo MÍNIMO viable** (MVP)

**MVP = Producto Mínimo Viable**

Pregunto: ¿Cuál es la versión MÁS simple posible que aún resuelve el problema?

- Usuarios: Pueden buscar doctores y agendar
- Doctores: Pueden ver sus citas
- Pagos: Manual por ahora (Stripe después)
- Videollamada: Usar Zoom/Meet link (conectar API después)

**Por qué esto funciona:**
- Pruebo si la IDEA funciona antes de invertir mucho
- Si la idea no funciona, pierdo 1 semana, no 3 meses
- Si funciona, AGREGO lo demás, no refactorizo

---

### PASO 4: **Stack SIMPLE basado en el problema** (1 hora)

**NO investigo "qué es lo mejor"**

Pregunto: ¿Qué necesito REALMENTE?

- Necesito base de datos → PostgreSQL (lo que todo el mundo usa)
- Necesito que funcione en web → Next.js (React + backend)
- Necesito pagos → Stripe (el estándar)
- Necesito que sea rápido → Vercel (deploy)

**NO pienso en:**
- ¿Es GraphQL mejor que REST? (no lo necesito saber aún)
- ¿Qué framework de CSS? (el que viene con Next.js está bien)
- ¿Debo usar microservicios? (NO, eres un solo proyecto)

---

### PASO 5: **UNA sola cosa a la vez** (Regla de oro)

**Tu error:** Le das TODO a la IA de golpe

**Mi enfoque:**

Semana 1: Solo usuarios y búsqueda de doctores
Semana 2: Solo agendar (sin pagos reales)
Semana 3: Solo pagos (Stripe)
Semana 4: Solo videollamada

**Cada semana:**
- Construyo UNA cosa
- La PRUEBO
- La dejo FUNCIONANDO
- Paso a la siguiente

**Resultado:**
- Nunca tengo código obsoleto (porque lo probé antes)
- Nunca tengo que limpiar "cosas que no usé"
- Cada pieza ya estaba probada cuando agregué la siguiente

---

### PASO 6: **NO construyas lo que NO necesitas AÚN**

**Tu error:** Quieres TODO de golpe

**Mi enfoque:**

- ¿De verdad necesitas 10 tipos de usuarios? NO, empieza con 1
- ¿De verdad necesitas recomendación IA? NO, empieza con búsqueda simple
- ¿De verdad necesitas 5 formas de pago? NO, empieza con 1

**Regla:** Si no es CRÍTICO para que tu idea funcione, NO lo construyas aún

---

## 🔥 LA VERDAD QUE NADIE TE DICE:

### El 80% del tiempo que pasas "limpiando y refactorizando" es por decisiones que tomaste ANTES de escribir la primera línea de código.

Es como construir una casa sin planos:
- Pones paredes donde no deben ir
- Pones ventanas que no conectan con habitaciones
- Luego pasas meses demoliendo y reconstruyendo

**Los arquitectos NO construyen sin planos. Tú tampoco.**

---

## 💡 LA MENTALIDAD QUE NECESITAS:

### Cambia esto: "Quiero todo desde el principio"

### Por esto: "Quiero lo MÍNIMO que funcione, luego AGREGO"

---

## 🎯 MI RECOMENDACIÓN PARA TU PRÓXIMO PROYECTO:

### 1. **Antes de hablar con cualquier IA:**

- Escribe en UNA página: ¿Qué problema resuelvo? ¿Para quién?
- Dibuja en papel: ¿Cómo se usará mi sistema? (flechas y cajas)
- Marca con estrella (⭐) lo que es CRÍTICO, el resto es "nice to have"

### 2. **Tu primera conversación con la IA de construcción:**

NO le digas: "Construye todo esto"

DILE: "Construye SOLO esto:" [lista SOLO las 3 cosas críticas que marcaste con estrella]

### 3. **Después de que la IA construya:**

- PRUEBA lo que hizo
- ¿Funciona? Bien
- ¿No funciona? Pide que lo arregle ANTES de agregar la siguiente cosa

### 4. **Solo cuando lo anterior FUNCIONA:**

- Agrega la siguiente cosa más importante
- Repite el ciclo

---

## 📊 COMPARACIÓN:

| Tu enfoque | Mi enfoque |
|-----------|-----------|
| Investigación exhaustiva | Solo investigo lo que NECESITO para el MVP |
| Le doy TODO a la IA | Le doy UNA cosa a la vez |
| Construyo todo de golpe | Construyo en capas, cada capa probada |
| 50% tiempo construyendo, 50% limpiando | 90% tiempo construyendo, 10% ajustes |
| Código obsoleto por cambios | Código estable porque probé antes |

---

## 🔥 LA VERDADERA RAZÓN DE TU CICLO INFINITO:

**Tu problema NO es que no sepas programar.**

**Tu problema es que tratas a tu proyecto como si fuera un restaurante donde pides el menú completo de entrada:**

- Entrada
- Plato fuerte
- Postre
- Bebida
- Café
- Mantequilla
- Pan

**Claro que te va a salir caro y vas a tirar comida.**

---

**Los buenos restaurantes (y los buenos proyectos) sirven en cursos:**

- Primero el plato principal
- Si está bueno, pides postre
- Si seguís con hambre, pides entrada

---

## 🎯 RESUMEN EN UNA FRASE:

**"Construye LO MÍNIMO que funciona, pruébalo, estabilízalo, y solo AGREGA lo siguiente."**

---

*Fin de Respuesta #1*

---

## 📋 SECCIÓN 2: CÓMO YO HARÍA TUS PROYECTOS SI FUERA TÚ

### PREGUNTA #2: Basándote en mi proceso actual, descríbeme paso a paso cómo lo harías tú si fueras yo

---

### TU PROCESO ACTUAL (lo que ME dijiste):

1. Describo idea extensamente a un agente
2. Hago deep research para inspiración
3. Pregunta qué stack/diseño usar
4. Le doy todo a un agente de construcción
5. Terminar con código innecesario/obsoleto
6. Paso mucho tiempo limpiando/errors/refuerzo

---

### CÓMO YO HARÍA TUS PROYECTOS SI FUERA TÚ (Paso a paso):

---

#### 📋 PASO 1: Definir el PROBLEMA (30 minutos máximo)

**Lo que haría:**

Abriría un documento en blanco y escribiría:

```
Título: [Mi proyecto]

Pregunta 1: ¿Qué problema resuelvo?
Respuesta: [Ejemplo: "Las personas no pueden encontrar doctores buenos cuando están enfermos"]

Pregunta 2: ¿Quién tiene el problema?
Respuesta: [Ejemplo: "Pacientes en México que necesitan cita médica urgente"]

Pregunta 3: ¿Por qué es urgente?
Respuesta: [Ejemplo: "Cuando estás enfermo, no puedes esperar 2 semanas"]

Pregunta 4: ¿Qué quiere hacer el usuario?
Respuesta: [Ejemplo: "Encontrar doctor → Agendar → Ir a cita"]
```

**Por qué haría esto:**
- Si no sé CLARAMENTE qué problema resuelvo, no sé qué construir
- Si no sé QUIÉN es mi usuario, no sé qué necesitan
- Si no sé por qué es urgente, no sé qué es lo MÍNIMO viable

**NO haría:**
- ❌ Deep research de otros proyectos (aún no sé qué buscar)
- ❌ Preguntar por stack tecnológico (no sé qué necesito aún)
- ❌ Pedir a una IA que construya TODO (ni sé qué es TODO)

---

#### 📋 PASO 2: Dibujar el FLUJO en papel (1 hora)

**Lo que haría:**

Tomaría una hoja de papel y un lápiz. Dibujaría:

```
[PACIENTE] → [Busca doctores] → [Ve lista] → [Elige Dr. Pérez] → [AGENDA]
                 ↓
            [Filtros por: especialidad, ubicación, precio]

Los datos que NECESITO:
- Del paciente: nombre, síntomas
- Del doctor: nombre, especialidad, precio, ubicación
- De la cita: fecha, hora, motivo
```

**Por qué haría esto:**
- El dibujo ME OBLIGA a pensar qué datos necesito REALMENTE
- Si no dibujo el flujo, la IA me va a generar 20 páginas de código que no necesito
- En papel se ve CLARAMENTE qué es esencial y qué es "nice to have"

**Ejemplo:**
- ❌ Tu enfoque: "Construir sistema completo con ratings, reviews, historial, notificaciones, IA recommendations"
- ✅ Mi enfoque: "Página que lista doctores + botón de agendar" (SOLO eso, lo demás después)

---

#### 📋 PASO 3: Definir MÍNIMO VIABLE (1 hora)

**Lo que haría:**

En el mismo documento, escribiría:

```
MVP = Mínimo Producto Viable

Lo MÍNIMO que necesito para PROBAR que la idea funciona:

Semana 1:
- ✅ Usuario puede buscar doctores
- ✅ Usuario ve información básica del doctor
- ✅ Usuario puede hacer click en "agendar"
- ✅ Llega notificación al doctor (email simple)

NO incluyo en Semana 1:
- ❌ Pagos (los manejo manualmente)
- ❌ Videollamada (uso Zoom link)
- ❌ Calificaciones/reseñas
- ❌ Historial de citas
- ❌ Recomendaciones IA

Agregaré estos SOLO cuando la parte básica FUNCIONE.
```

**Por qué haría esto:**
- Si intento TODO de golpe, la IA genera 500 archivos de código
- Si voy agregando poco a poco, cada paso es CLARO y PROBADO
- Si la idea no funciona, solo tiré 1 semana, no 3 meses

---

#### 📋 PASO 4: PREPARAR prompts para la IA (30 minutos)

**Lo que haría:**

Escribiría prompts específicos, UNO por cada cosa. NO un prompt gigante.

```
Prompt 1 - Solo búsqueda de doctores:
"Quiero una página donde los usuarios puedan buscar doctores.
Filtros: especialidad, ubicación, precio.
Dato: Cada doctor tiene: nombre, especialidad, precio, ciudad.
Muéstrame: solo el código HTML y CSS necesario para MOSTRAR la lista.
NO incluyas: pagos, reseñas, historial, notificaciones."

Prompt 2 - Solo el botón de agendar:
"Agrega un botón 'Agendar Cita' a cada doctor.
Cuando hacen click, muestra un formulario simple: nombre, teléfono, motivo.
NO guarda en base de datos aún. Solo muestra los datos en consola."
```

**Por qué haría esto:**
- Le doy a la IA UNA tarea a la vez
- La IA no puede "adivinar" lo que no le especifiqué
- Si le doy TODO de golpe, la IA me genera COSAS QUE NO NECESITO

---

#### 📋 PASO 5: REVISAR lo que la IA generó (antes de continuar)

**Lo que haría:**

```
Carpeta: proyecto/semana1/
├── pagina-doctores.tsx
├── api/buscar.ts
└── api/agendar.tsx

Lo que reviso:
✓ ¿Solo hace LO QUE PEDÍ? (no agregó cosas extra?)
✓ ¿Usa nombres de variables claros? (no `data1`, `temp`)
✓ ¿Hay tipos definidos? (no `any`)
✓ ¿Funciona? (pruebo en el navegador)
```

**Por qué haría esto:**
- Las IAs "inventan" cosas si les das demasiada libertad
- Debo REVISAR que no agregó 10 cosas que no le pedí
- Si hay algo que no necesito, SE BORRA antes de continuar

---

#### 📋 PASO 6: PROBAR antes de agregar siguiente cosa (1 día)

**Lo que haría:**

```
Semana 1 implementada:
- Pruebo buscar doctores → ✅ Funciona
- Pruebo agendar → ✅ Funciona
- Pruebo que no se rompe → ✅ Funciona

SOLO ENTONCES voy a Semana 2:
- Agregar pagos reales
```

**Por qué haría esto:**
- Si la Semana 1 tiene bugs, los arreglo ANTES de agregar Semana 2
- Si agrego todo de golpe y hay errores, NO SÉ de dónde viene el error
- Cada capa está probada antes de agregar la siguiente

---

#### 📋 PASO 7: Agregar siguiente capa SOLO cuando la anterior ESTÁ ESTABLE (2 semanas)

**Lo que haría:**

```
Semana 1: Búsqueda + agendar (estable) ✅
Semana 2: Agregar pagos Stripe → PROBAR → ✅ Estable
Semana 3: Agregar videollamada → PROBAR → ✅ Estable
Semana 4: Agregar reseñas → PROBAR → ✅ Estable
```

**Por qué haría esto:**

Imagina un edificio:
```
Piso 1: Construyo y pruebo → ESTÁ FIRME ✅
Piso 2: Construyo SOLO si Piso 1 está firme ✅
Piso 3: Construyo SOLO si Piso 2 está firme ✅

VS TU ENFOQUE:
Construyo Pisos 1, 2, 3, 4 todos a la vez →
Piso 1 tiene grietas → Piso 2 se cae → Piso 3 se cae →
TODO SE VENDE ABAJO
```

---

#### 📋 PASO 8: Cada 3 días, hacer LIMPIEZA de lo que agregué (30 minutos)

**Lo que haría:**

```
Día 3: Reviso Semana 1
¿Hay código que no uso? → ELIMINO
¿Hay tipos `any`? → ARREGLO
¿Hay duplicados? → UNIFICO

Día 6: Reviso Semana 1 + Semana 2
¿Hay redundancia entre las dos? → ELIMINO
¿Se pueden combinar? → FUSIONO

Día 9: Reviso todo
¿Hay patrón que se repite? → Extraigo a función
¿Hay archivo muy grande? → Divido
```

**Por qué haría así:**
- La limpieza es CONSTANTE, no al final
- 30 minutos cada 3 días = 1.5 horas por semana
- VS tu enfoque: 20 horas de limpieza al final

---

#### 📋 PASO 9: Cada vez que agrego algo, pregunto "¿ES NECESARIO?" (5 segundos)

**Lo que haría:**

Antes de pedirle a la IA que agregue algo, me pregunto:

```
¿Esto es CRÍTICO para que el sistema funcione?
  - Sí → Lo construyo
  - No → LO DEJO PARA DESPUÉS
```

**Ejemplo real:**

```
¿Es CRÍTICO tener 5 formas de pago?
  → No, con 1 basta para empezar
  → Agrego las otras 4 después

¿Es CRÍTICO tener 10 tipos de filtros?
  → No, con 3 basta (especialidad, ubicación, precio)
  → Los otros 7 los agrego si alguien los pide
```

**Por qué haría esto:**
- Tú le das TODO a la IA → Te genera TODO
- Yo filtro lo que es ESENCIAL → La IA genera SOLO lo necesario
- Mi código es 20% del tuyo, pero 100% probado

---

### COMPARACIÓN DIRECTA:

| TU ENFOQUE | MI ENFOQUE |
|-----------|-----------|
| Describo TODO a la IA | Defino PROBLEMA primero |
| Deep research antes | Dibujo flujo en papel |
| Le doy TODO de golpe | Construyo en capas probadas |
| Agrego TODO y limpio después | Agrego SOLO lo necesario, limpio constante |
| 80% tiempo limpiando | 90% tiempo construyendo bien |

---

### EN RESUMEN:

**MI PROCESO = 9 pasos**

1. Definir problema (30 min)
2. Dibujar flujo en papel (1 hora)
3. Definir mínimo viable (1 hora)
4. Preparar prompts específicos (30 min)
5. Revisar lo que la IA generó
6. Probar antes de continuar
7. Agregar siguiente capa SOLO cuando anterior está estable
8. Limpieza constante (cada 3 días)
9. Preguntar "¿Es necesario?" antes de agregar

**LA CLAVE:** Construyo en capas, cada capa probada, antes de agregar la siguiente.

---

*Fin de Respuesta #2*

---

## 📋 SECCIÓN 3: ARQUITECTURA Y DISEÑO

### PREGUNTA #3: ¿Cómo agregas nuevas features asegurando que UI/UX estén alineados, los flujos tengan sentido, y el código se refleje en calidad visual?

**Tu pregunta:**
"¿Cómo agregarías nuevas features, te asegurarías de que el UI/UX estuvieran alineados, lógicos y frictionless para el user, que los flujos y cada pantalla tuvieran sentido (que el dashboard tenga lo que debe tener y no, por ejemplo, configuraciones básicas de la app o perfil en el dashboard, cosas así), etc... todos esos detalles con los que te topas cuando ya tienes una codebase comprensible (quizas todavia no limpia y sin errores, pero funcional) y quieres desarrollarla mas para que no solo funcione bien, sino que se vea y se sienta bien, que sea visible el nivel de calidad. Que el codigo con la disciplina y cuidado que lo estás construyendo refleje todo esto en su apariencia y funcionamiento ante el usuario"

---

## 🎯 LA VERDAD SOBRE UI/UX Y CÓDIGO DE CALIDAD:

**Hay una relación DIRECTA entre código limpio y UX limpio.**

Piénsalo:
- Código desorganizado → UI desorganizada
- Código sin estructura → UX confusa
- Código con "todo mezclado" → Dashboard con "todo mezclado"

**La disciplina en el código SIEMPRE se refleja en la experiencia del usuario.**

---

## 📋 MI ENFOQUE PARA AGREGAR FEATURES CON UI/UX DE CALIDAD:

### PASO 1: Entender el MAPA MENTAL del usuario (antes de código)

**Lo que haría:**

Antes de escribir UNA línea de código para una nueva feature, me pregunto:

```
1. ¿Dónde está el usuario MENTALMENTE cuando llega aquí?
   - ¿Viene de ver una lista? → Espera ver detalles
   - ¿Viene de un error? → Espera solución clara
   - ¿Viene de completar algo? → Espera confirmación

2. ¿Qué quiere lograr en ESTE momento específico?
   - NO "qué quiere en general"
   - SINO "qué quiere AHORA MISMO"

3. ¿Qué NO debería ver aquí?
   - Configuraciones → van en Settings
   - Historial viejo → va en Historial
   - Estadísticas → van en Dashboard/Analytics
```

**Ejemplo real - Dashboard vs Settings:**

```
❌ TU ENFOQUE (común error):
Dashboard:
- Mis citas próximas
- Mis citas pasadas
- Editar perfil
- Cambiar contraseña
- Notificaciones ON/OFF
- Estadísticas de uso
- Términos y condiciones

✅ MI ENFOQUE:
Dashboard (/app/dashboard):
- Citas HOY y mañana
- Botón grande "Agendar nueva cita"
- Acceso rápido a videollamada pendiente
- Últimos mensajes (si hay)

Settings (/app/settings):
- Perfil
- Seguridad
- Notificaciones
- Pagos
- Términos

Historial (/app/appointments):
- Todas las citas pasadas
- Filtros por fecha, doctor, especialidad
```

**Por qué importa:**
- El usuario va al dashboard para ver "¿Qué tengo HOY?"
- NO va al dashboard para cambiar su contraseña
- Cada pantalla tiene UN propósito claro

---

### PASO 2: Dibujar el FLUJO COMPLETO antes de UI

**Lo que haría:**

```
FLUJO DE AGENDAR CITA:

[Usuario en dashboard]
    ↓
[Click "Agendar Cita"]
    ↓
[Pregunta: ¿Para cuándo?]
    ├─ Hoy → [Mostrar doctores disponibles HOY]
    ├─ Mañana → [Mostrar doctores disponibles MAÑANA]
    └─ Otro día → [Calendario para elegir fecha]
    ↓
[Usuario elige fecha]
    ↓
[Pregunta: ¿Qué especialidad?]
    ↓
[Usuario elige especialidad]
    ↓
[Lista de doctores disponibles]
    ↓
[Usuario elige doctor]
    ↓
[Confirmar: Fecha, Hora, Doctor, Precio]
    ↓
[Pagar]
    ↓
[¡Cita confirmada!] → [Volver al dashboard]

LO QUE NO HARÍA:
❌ Saltar del dashboard directamente a lista de 500 doctores
❌ No mostrar la fecha seleccionada en el siguiente paso
❌ No confirmar antes de pagar
❌ No volver al dashboard después de confirmar
```

**Principio clave:**
- Cada paso debe responder UNA pregunta del usuario
- El usuario debe saber SIEMPRE:
  1. ¿Dónde estoy?
  2. ¿Qué hago aquí?
  3. ¿Cómo vuelvo?

---

### PASO 3: Principios de UX FRICTIONLESS (sin fricción)

**Lo que aplico a CADA pantalla:**

#### 1. UNA acción principal por pantalla

```
❌ MAL:
Página del doctor:
- Ver perfil
- Agendar cita
- Dejar reseña
- Ver otros doctores
- Ver mapa
- Llamar
- Chatear
- Compartir

✅ BIEN:
Página del doctor:
- [ACCION PRINCIPAL] Agendar cita (botón grande, visible)
- [SECUNDARIO] Ver perfil completo
- [SECUNDARIO] Ver reseñas
- [SECUNDARIO] Ver ubicación

El resto:
- Dejar reseña → Solo DESPUÉS de la cita
- Llamar → Solo si el doctor tiene habilitado
- Chatear → Página separada de mensajes
```

#### 2. Mostrar INFORMACIÓN PROGRESIVA

```
Paso 1: Usuario ve lista de doctores
→ Muestra SOLO: nombre, especialidad, precio, rating

Paso 2: Usuario hace click en un doctor
→ Muestra: perfil completo, experiencia, educación

Paso 3: Usuario va a agendar
→ Muestra: horarios disponibles

NO muestro TODO en el paso 1.
```

#### 3. REDUCIR clics, NO reducir claridad

```
❌ MAL (demasiados clics):
Agendar → Seleccionar especialidad → Siguiente →
Seleccionar doctor → Siguiente → Seleccionar fecha →
Siguiente → Seleccionar hora → Siguiente → Confirmar

✅ BIEN (menos clics, misma claridad):
Agendar → Seleccionar especialidad (mostrar doctores) →
Seleccionar doctor (mostrar calendario) →
Seleccionar fecha/hora → Confirmar

LA DIFERENCIA:
- Eliminé los botones "Siguiente" innecesarios
- Cada selección muestra lo siguiente AUTOMÁTICAMENTE
- El usuario AVANZA sin hacer clics extra
```

#### 4. FEEDBACK inmediato para CADA acción

```
Usuario hace click → SIEMPRE hay respuesta:

Click "Agendar" → [Loading...] → [Se abre formulario]
Submit formulario → [Enviando...] → [¡Cita agendada!]
Error → [Mensaje claro de qué salió mal + cómo solucionarlo]

NUNCA:
❌ Click y no pasa nada
❌ Loading eterno sin explicación
❌ Error técnico que el usuario no entiende
```

---

### PASO 4: Organización de PANTALLAS por PROPÓSITO

**Mi estructura mental de una app:**

```
/app/dashboard          → "¿Qué tengo HOY?"
/app/appointments       → "Mis citas (todas)"
/app/doctors            → "Buscar doctores"
/app/messages           → "Mis mensajes"
/app/settings           → "Configurar mi cuenta"
/app/profile/[id]       → "Ver perfil de doctor"
/app/appointments/[id]  → "Detalle de cita específica"

Cada ruta tiene UN propósito claro.
```

**Lo que NO haría:**

```
❌ /app/dashboard/configuraciones
   → Las configuraciones NO van en el dashboard

❌ /app/appointments?page=2&sort=date&filter=past
   → Esto es "listado", no "detalle"
   → Mejor: /app/appointments con filtros visuales

❌ /app/doctor-profile?id=123
   → Usar :id en la ruta, no query params
   → Mejor: /app/profile/123 o /app/doctors/123
```

---

### PASO 5: COHERENCIA VISUAL = CÓDIGO COHERENTE

**Cómo aseguro que todo se vea consistente:**

#### 1. Sistema de DISEÑO antes de components

```
src/design-system/
├── colors.ts          # Paleta de colores
├── typography.ts      # Fuentes, tamaños
├── spacing.ts         # Espaciados (4px, 8px, 16px...)
├── shadows.ts         # Sombras
├── border-radius.ts   # Bordes redondeados
└── animations.ts      # Transiciones

ESTO define el "look & feel"
Luego, TODOS los componentes usan ESTO
```

**Ejemplo de colors.ts:**
```typescript
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',  // Color principal
    600: '#0284c7',
  },
  success: {
    500: '#22c55e',  // Para cosas que salieron bien
  },
  error: {
    500: '#ef4444',  // Para errores
  },
  // ...
} as const

// NO colores "al vuelo" como "#ff0000"
```

#### 2. Components REUTILIZABLES, no "copiar y pegar"

```
❌ TU ENFOQUE:
// en doctor-card.tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">

// en appointment-card.tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">

// DUPLICACIÓN

✅ MI ENFOQUE:
// Creo <Card> component
<Card variant="primary" padding="md">
  <!-- Contenido -->
</Card>

// USO EN TODOS LADOS
```

**Por qué importa:**
- Si el cambio de diseño es "cambiar el border-radius"
- ❌ Tu enfoque: cambiar en 50 archivos
- ✅ Mi enfoque: cambiar en 1 archivo (el component)

#### 3. PATRONES de interacción consistentes

```
Si "confirmar" es un botón azul a la derecha:
→ TODOS los botones de confirmar son azules a la derecha

Si "cancelar" es un botón gris a la izquierda:
→ TODOS los botones de cancelar son grises a la izquierda

Si "eliminar" requiere confirmación:
→ TODAS las eliminaciones requieren confirmación

El usuario APRENDE una vez, aplica en TODA la app.
```

---

### PASO 6: Testing UX = Testing con USUARIOS reales

**Lo que haría antes de decir "feature completa":**

```
1. YO MISMO uso la feature 5 veces
   - ¿Me sentí confundido en algún paso?
   - ¿Tuve que pensar "¿dónde está X"?
   - ¿Algo me pareció lento o frustrante?

2. Pido a UNA persona (que no conoce el proyecto) que la use
   - NO le digo cómo usarla
   - Solo le digo "agrupa una cita"
   - Observo dónde se traba

3. Documento los problemas
   - "El usuario no encontró el botón de pagar"
   - "No entendió qué significaba 'disponible'"
   - "Buscó 'historial' y no lo encontró"

4. Arreglo los problemas ANTES de seguir
```

---

### PASO 7: CÓDIGO limpio = SEÑALES visuales de calidad

**La relación directa entre código y UX:**

| Código | UX |
|--------|-----|
| Variables claras (`patientName`, no `n`) | UI clara ("Juan Pérez", no "Usuario") |
| Funciones pequeñas | Pantallas enfocadas |
| Tipos definidos | Mensajes de error específicos |
| Manejo de errores | UX que no se rompe |
| Loading states | Loading indicators |
| Validación de inputs | Mensajes de validación |

**Ejemplo:**

```typescript
// CÓDIGO LIMPIO
function validateAppointment(data: AppointmentData): ValidationResult {
  if (!data.patientId) {
    return {
      valid: false,
      error: 'Selecciona un paciente',
      field: 'patientId'
    }
  }
  // ...
}

// UX LIMPIA (gracias al código limpio)
if (!result.valid) {
  showFieldError(result.field, result.error)
  // "Selecciona un paciente" aparece debajo del campo correcto
}
```

---

## 🎨 EJEMPLO COMPLETO: Feature "Agendar Cita"

### Lo que haría PASO A PASO:

#### FASE 1: Planning (sin código)

```
1. DEFINIR el flujo:
   Dashboard → Click "Agendar" → Elegir fecha →
   Elegir especialidad → Ver doctores →
   Elegir doctor → Elegir hora → Confirmar → Pagar

2. DEFINIR qué va en CADA pantalla:
   - Dashboard: Solo botón "Agendar cita"
   - /app/appointments/new: Selección de fecha y especialidad
   - /app/appointments/new?date=X&specialty=Y: Lista de doctores
   - /app/doctors/[id]/book: Selección de hora
   - /app/appointments/confirm: Confirmación y pago

3. DEFINIR estados:
   - Loading (mientras carga doctores)
   - Empty (si no hay doctores disponibles)
   - Error (si algo falla)
   - Success (cita confirmada)
```

#### FASE 2: Componentes

```
/app/appointments/new/page.tsx
├── DateSelector (componente reutilizable)
├── SpecialtySelector (componente reutilizable)
└── DoctorList (usa <DoctorCard> repetido)

/app/doctors/[id]/book/page.tsx
├── TimeSlotGrid (slots de horas)
└── BookingSummary (resumen)
```

#### FASE 3: Validación y errores

```typescript
// Antes de UI, defino qué puede salir mal
const bookingErrors = {
  NO_SLOTS: 'No hay horarios disponibles para esta fecha',
  DOCTOR_UNAVAILABLE: 'El doctor no está disponible',
  INVALID_DATE: 'La fecha debe ser futura',
  // ...
}

// Luego, la UI muestra estos mensajes
```

#### FASE 4: Testing

```
1. YO uso el flujo 5 veces
2. Encuentro problema: "No sé cuándo estoy seleccionando fecha"
3. Solución: Agregar título claro "Selecciona fecha de tu cita"
4. Re-test
5. ✅ Listo
```

---

## 📊 CHECKLIST de UX antes de decir "Feature completa"

```
ORGANIZACIÓN:
☐ Cada pantalla tiene UN propósito claro
☐ El dashboard NO tiene configuraciones
☐ Settings NO tiene acciones del día a día
☐ Historial está separado de acciones actuales

FLUJO:
☐ El usuario sabe SIEMPRE dónde está
☐ El usuario sabe CÓMO volver atrás
☐ Hay feedback por CADA acción
☐ Los errores son entendibles (no técnicos)

VISUAL:
☐ Colores consistentes (sistema de diseño)
☐ Tipografía consistente
☐ Espaciados consistentes
☐ Componentes reutilizables

REDUCIR FRICCIÓN:
☐ Minimizar clics necesarios
☐ Información progresiva (no abrumar)
☐ Auto-avanzar cuando sea posible
☐ Pre-seleccionar opciones obvias

CÓDIGO → UX:
☐ Loading states en todas las operaciones asíncronas
☐ Validación de inputs con mensajes específicos
☐ Manejo de errores con acciones sugeridas
☐ Sin "console.log" en producción
```

---

## 🔥 LA VERDAD FINAL:

**UI/UX de calidad NO es "hacerlo bonito".**

**UI/UX de calidad es:**
1. Pensar en el usuario ANTES de escribir código
2. Cada pantalla tiene UN propósito
3. Cada flujo es LÓGICO y PREDECIBLE
4. Cada acción tiene FEEDBACK
5. Todo es CONSISTENTE

**Y TODO esto se refleja en el código:**
- Código organizado → UI organizada
- Componentes reutilizables → UX consistente
- Manejo de errores → UX que no se rompe
- Loading states → UX que se siente rápida

---

*Fin de Respuesta #3*

---

## 📋 SECCIÓN 4: HERRAMIENTAS Y AUTOMACIÓN

*(Preguntas pendientes - Awaiting user questions)*

---

## 📋 SECCIÓN 5: MÉTRICAS Y MONITOREO

*(Preguntas pendientes - Awaiting user questions)*

---

## 📋 SECCIÓN 6: PATRONES Y ANTI-PATRONES

*(Preguntas pendientes - Awaiting user questions)*

---

*Estado: Esperando preguntas del usuario...*

---

## 📋 SECCIÓN 7: GUÍA DEFINITIVA INTEGRADA (TODO EN UN SOLO FLUJO)

### PREGUNTA #4: Integra todo en una guía paso a paso completa

**Lo que pides:**
"Incluye tu respuesta de UI/UX al flujo que me describiste en la primera respuesta para que, de nuevo, sea una guía paso a paso de cómo tú lo harías"

---

## 🎯 LA GUÍA DEFINITIVA: CÓMO CONSTRUIR UN PROYECTO DE CERO A PRODUCCIÓN

Esta es la integración de TODO lo que hemos hablado en un solo flujo coherente.

---

## 📋 FASE 0: ANTES DE EMPEZAR (Mindset)

### LA MENTALIDAD QUE NECESITAS:

```
❌ CAMBIAR ESTO:
   "Quiero todo desde el principio"
   "Le doy todo a la IA y veo qué sale"
   "Luego limpio lo que no sirva"

✅ POR ESTO:
   "Construyo LO MÍNIMO que funciona"
   "Lo pruebo, lo estabilizo, AGREGO lo siguiente"
   "La limpieza es CONSTANTE, no al final"
```

### EL PRINCIPIO FUNDAMENTAL:

> **Cada capa de código debe estar PROBADA y ESTABLE antes de agregar la siguiente.**
>
> **Código limpio = UX limpia. La disciplina en el código se refleja en la experiencia del usuario.**

---

## 📋 FASE 1: DEFINICIÓN (30 minutos - 1 día)

### PASO 1.1: Definir el PROBLEMA (30 minutos)

**Lo que hago:**

```
Abrir un documento y escribir:

Título: [Mi proyecto]

Pregunta 1: ¿Qué problema resuelvo?
→ Ejemplo: "Las personas no pueden encontrar doctores cuando están enfermos"

Pregunta 2: ¿Quién tiene el problema?
→ Ejemplo: "Pacientes en México que necesitan cita urgente"

Pregunta 3: ¿Por qué es urgente?
→ Ejemplo: "Cuando estás enfermo, no puedes esperar 2 semanas"

Pregunta 4: ¿Qué quiere hacer el usuario?
→ Ejemplo: "Encontrar doctor → Agendar → Pagar → Tener cita"
```

**Checklist:**
- ☐ El problema está definido en UNA frase clara
- ☐ Sé QUIÉN es mi usuario
- ☐ Sé por qué es URGENTE

---

### PASO 1.2: Dibujar el FLUJO en papel (1 hora)

**Lo que hago:**

Tomar papel y lápiz, dibujar:

```
[PACIENTE] → [Busca doctores] → [Ve lista] → [Elige doctor] → [AGENDA] → [PAGA] → [Cita confirmada]

Los datos que NECESITO:
- Del paciente: nombre, síntomas
- Del doctor: nombre, especialidad, precio, ubicación
- De la cita: fecha, hora, motivo
```

**LO QUE NO HARÍA aquí:**
- ❌ Pensar en stack tecnológico
- ❌ Pensar en diseño visual
- ❌ Pensar en features "bonitas"

**Checklist:**
- ☐ El flujo tiene INICIO y FIN claros
- ☐ Sé qué datos necesito en CADA paso
- ☐ Sé qué puede salir mal

---

### PASO 1.3: Definir MÍNIMO VIABLE - MVP (1 hora)

**Lo que hago:**

```
MVP = Mínimo Producto Viable

Lo MÍNIMO para PROBAR que la idea funciona:

Semana 1:
✅ Usuario puede buscar doctores
✅ Usuario ve info básica del doctor
✅ Usuario puede hacer click en "agendar"
✅ Llega notificación al doctor (email simple)

NO en Semana 1:
❌ Pagos (los manejo manualmente)
❌ Videollamada (uso Zoom link)
❌ Calificaciones/reseñas
❌ Historial de citas
❌ Recomendaciones IA
```

**Checklist:**
- ☐ Marqué con ⭐ lo CRÍTICO
- ☐ El resto está en "nice to have"
- ☐ Sé qué AGREGARÉ después de probar

---

## 📋 FASE 2: ESTRUCTURA Y STACK (1 hora)

### PASO 2.1: Stack SIMPLE basado en el problema

**Pregunto: ¿Qué necesito REALMENTE?**

```
Necesito base de datos → PostgreSQL (lo que todos usan)
Necesito web → Next.js (React + backend)
Necesito pagos → Stripe (el estándar)
Necesito deploy → Vercel

NO pienso en:
❌ ¿GraphQL vs REST? (no lo necesito aún)
❌ ¿Framework de CSS? (el que viene está bien)
❌ ¿Microservicios? (NO, eres un solo proyecto)
```

---

### PASO 2.2: Definir ESTRUCTURA de rutas por PROPÓSITO

**Esto es CRÍTICO para UI/UX:**

```
/app/dashboard          → "¿Qué tengo HOY?"
/app/appointments       → "Mis citas (todas)"
/app/doctors            → "Buscar doctores"
/app/messages           → "Mis mensajes"
/app/settings           → "Configurar mi cuenta"
/app/profile/[id]       → "Ver perfil de doctor"

Cada ruta = UN propósito claro
```

**LO QUE NO HARÍA:**
```
❌ /app/dashboard/configuraciones  → Configuraciones NO van en dashboard
❌ /app/doctor-profile?id=123      → Usar :id, no query params
```

**Checklist:**
- ☐ Cada ruta tiene UN propósito
- ☐ Dashboard NO tiene configuraciones
- ☐ Settings NO tiene acciones del día a día

---

## 📋 FASE 3: CONSTRUCCIÓN CAPA POR CAPA (Semanas 1-4+)

### PASO 3.1: Preparar PROMPTS ESPECÍFICOS (30 minutos)

**Lo que hago:**

```
NO: Un prompt gigante con TODO

SÍ: Un prompt por cada cosa

Prompt 1 - Solo búsqueda de doctores:
"Quiero una página donde usuarios busquen doctores.
Filtros: especialidad, ubicación, precio.
Dato: Cada doctor tiene nombre, especialidad, precio, ciudad.
Muéstrame: SOLO el código necesario para MOSTRAR la lista.
NO incluyas: pagos, reseñas, historial, notificaciones."

Prompt 2 - Solo el botón de agendar:
"Agrega botón 'Agendar Cita' a cada doctor.
Al hacer click, muestra formulario: nombre, teléfono, motivo.
NO guarda en BD. Solo muestra datos en consola."
```

**Por qué:**
- Le doy a la IA UNA tarea a la vez
- La IA no puede "adivinar" lo que no especifiqué
- Si le doy TODO, genera COSAS QUE NO NECESITO

---

### PASO 3.2: SEMANA 1 - Búsqueda y Agendar (Básico)

**Lo que construyo:**
- ✅ Página de búsqueda de doctores
- ✅ Filtros: especialidad, ubicación, precio
- ✅ Botón "Agendar Cita"
- ✅ Formulario simple (no guarda aún)

**ANTES de pasar a Semana 2:**
- ☐ Pruebo buscar doctores → ✅ Funciona
- ☐ Pruebo agendar → ✅ Funciona
- ☐ Pruebo que no se rompe → ✅ Funciona

**REVISIÓN de lo que la IA generó:**
```
Carpeta: proyecto/semana1/
├── pagina-doctores.tsx
├── api/buscar.ts
└── api/agendar.tsx

Lo que reviso:
✓ ¿Solo hace LO QUE PEDÍ? (no agregó cosas extra?)
✓ ¿Usa nombres de variables claros? (no `data1`, `temp`)
✓ ¿Hay tipos definidos? (no `any`)
✓ ¿Funciona en el navegador?
```

---

### PASO 3.3: SEMANA 2 - Agendar Real + Pagos

**ANTES de codear, defino FLUJO COMPLETO:**

```
[Usuario en dashboard]
    ↓
[Click "Agendar Cita"]
    ↓
[Pregunta: ¿Para cuándo?]
    ├─ Hoy → [Doctores disponibles HOY]
    ├─ Mañana → [Doctores disponibles MAÑANA]
    └─ Otro día → [Calendario]
    ↓
[Usuario elige fecha]
    ↓
[Pregunta: ¿Qué especialidad?]
    ↓
[Usuario elige especialidad]
    ↓
[Lista de doctores disponibles]
    ↓
[Usuario elige doctor]
    ↓
[Confirmar: Fecha, Hora, Doctor, Precio]
    ↓
[Pagar con Stripe]
    ↓
[¡Cita confirmada!] → [Volver al dashboard]
```

**UI/UX que aplico:**
1. **UNA acción principal por pantalla**
2. **Información progresiva** (no abrumar)
3. **Reducir clics** (auto-avanzar cuando sea posible)
4. **Feedback inmediato** (loading, success, error)

**Checklist antes de continuar:**
- ☐ Pruebo el flujo completo 5 veces
- ☐ El usuario sabe SIEMPRE dónde está
- ☐ Hay feedback por CADA acción
- ☐ Los errores son entendibles (no técnicos)

---

### PASO 3.4: SEMANA 3 - Videollamada

**Lo que construyo:**
- ✅ Integración de videollamada
- ✅ Pantalla de espera
- ✅ Entrada a sala

**ANTES de continuar:**
- ☐ Pruebo videollamada completa → ✅ Funciona
- ☐ Pruebo que no se rompe si falla → ✅ Maneja error

---

### PASO 3.5: SEMANA 4 - Reseñas y extras

**Lo que construyo:**
- ✅ Calificaciones
- ✅ Reseñas
- ✅ Historial de citas

**Solo cuando LO ANTERIOR está 100% estable.**

---

## 📋 FASE 4: SISTEMA DE DISEÑO (Paralelo a construcción)

### PASO 4.1: Crear Design System ANTES de components

```
src/design-system/
├── colors.ts          # Paleta de colores
├── typography.ts      # Fuentes, tamaños
├── spacing.ts         # Espaciados (4px, 8px, 16px...)
├── shadows.ts         # Sombras
├── border-radius.ts   # Bordes redondeados
└── animations.ts      # Transiciones
```

**Ejemplo colors.ts:**
```typescript
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',  // Color principal
    600: '#0284c7',
  },
  success: {
    500: '#22c55e',
  },
  error: {
    500: '#ef4444',
  },
} as const
```

---

### PASO 4.2: Components REUTILIZABLES

```
❌ NO HACER:
// doctor-card.tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">

// appointment-card.tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
// DUPLICACIÓN

✅ HACER:
// Creo <Card> component
<Card variant="primary" padding="md">
  <!-- Contenido -->
</Card>
// USO EN TODOS LADOS
```

**Por qué importa:**
- Si necesitas cambiar el border-radius
- ❌ Tu enfoque: cambiar en 50 archivos
- ✅ Mi enfoque: cambiar en 1 archivo

---

### PASO 4.3: PATRONES de interacción consistentes

```
Si "confirmar" es botón azul a la derecha:
→ TODOS los botones de confirmar son azules a la derecha

Si "cancelar" es botón gris a la izquierda:
→ TODOS los botones de cancelar son grises a la izquierda

Si "eliminar" requiere confirmación:
→ TODAS las eliminaciones requieren confirmación

El usuario APRENDE una vez, aplica en TODA la app.
```

---

## 📋 FASE 5: LIMPIEZA CONSTANTE (Cada 3 días)

### PASO 5.1: Rutina de limpieza

```
Día 3: Reviso Semana 1
¿Hay código que no uso? → ELIMINO
¿Hay tipos `any`? → ARREGLO
¿Hay duplicados? → UNIFICO

Día 6: Reviso Semana 1 + Semana 2
¿Hay redundancia? → ELIMINO
¿Se pueden combinar? → FUSIONO

Día 9: Reviso todo
¿Hay patrón que se repite? → Extraigo a función
¿Hay archivo muy grande? → Divido
```

**Por qué así:**
- Limpieza CONSTANTE = 30 min cada 3 días = 1.5 hrs/semana
- VS tu enfoque: 20 horas de limpieza al final

---

## 📋 FASE 6: TESTING UX REAL (Antes de "feature completa")

### PASO 6.1: Yo MISMO uso la feature 5 veces

```
¿Me sentí confundido en algún paso?
¿Tuve que pensar "¿dónde está X"?
¿Algo me pareció lento o frustrante?
```

---

### PASO 6.2: Pido a UNA persona que la use

```
- NO le digo cómo usarla
- Solo le digo "agenda una cita"
- Observo dónde se traba
```

---

### PASO 6.3: Documento y arreglo

```
Problemas encontrados:
- "No encontró el botón de pagar"
- "No entendió 'disponible'"
- "Buscó 'historial' y no lo encontró"

Arreglo LOS PROBLEMAS ANTES de continuar
```

---

## 📋 FASE 7: CHECKLIST FINAL (Antes de producción)

### ORGANIZACIÓN:
```
☐ Cada pantalla tiene UN propósito claro
☐ El dashboard NO tiene configuraciones
☐ Settings NO tiene acciones del día a día
☐ Historial está separado de acciones actuales
```

### FLUJO:
```
☐ El usuario sabe SIEMPRE dónde está
☐ El usuario sabe CÓMO volver atrás
☐ Hay feedback por CADA acción
☐ Los errores son entendibles (no técnicos)
```

### VISUAL:
```
☐ Colores consistentes (sistema de diseño)
☐ Tipografía consistente
☐ Espaciados consistentes
☐ Componentes reutilizables
```

### REDUCIR FRICCIÓN:
```
☐ Minimizar clics necesarios
☐ Información progresiva (no abrumar)
☐ Auto-avanzar cuando sea posible
☐ Pre-seleccionar opciones obvias
```

### CÓDIGO:
```
☐ Loading states en todas las operaciones asíncronas
☐ Validación de inputs con mensajes específicos
☐ Manejo de errores con acciones sugeridas
☐ Sin "console.log" en producción
☐ 0 tipos `any`
☐ 0 magic numbers
☐ 0 archivos >500 líneas
```

---

## 📊 RESUMEN DEL PROCESO COMPLETO:

```
FASE 0: Mindset (5 min)
   → Cambiar mentalidad de "todo ya" a "capas probadas"

FASE 1: Definición (30 min - 1 día)
   → Definir problema
   → Dibujar flujo en papel
   → Definir mínimo viable

FASE 2: Estructura (1 hora)
   → Stack simple
   → Definir rutas por propósito

FASE 3: Construcción (semanas 1-4+)
   → Semana 1: Búsqueda + agendar básico
   → Semana 2: Agendar real + pagos
   → Semana 3: Videollamada
   → Semana 4: Extras
   → Cada capa: PROBAR → ESTABILIZAR → CONTINUAR

FASE 4: Design System (paralelo)
   → Colores, tipografía, espaciados
   → Components reutilizables
   → Patrones consistentes

FASE 5: Limpieza (cada 3 días)
   → Eliminar lo que no se usa
   → Unificar duplicados
   → Extraer patrones

FASE 6: Testing UX (continuo)
   → Yo uso la feature 5 veces
   → Otra persona la usa
   → Arreglo problemas

FASE 7: Checklist final
   → ORGANIZACIÓN ✅
   → FLUJO ✅
   → VISUAL ✅
   → FRICCIÓN ✅
   → CÓDIGO ✅
```

---

## 🔥 LA FÓRMULA EN UNA FRASE:

> **"Construye LO MÍNIMO que funciona, pruébalo, estabilízalo, pule el UI/UX, y solo AGREGA lo siguiente."**

---

## 📈 TU ENFOQUE vs MI ENFOQUE:

| TU ENFOQUE | MI ENFOQUE |
|-----------|-----------|
| Describo TODO a la IA | Defino PROBLEMA primero |
| Deep research antes | Dibujo flujo en papel |
| Le doy TODO de golpe | Construyo en capas probadas |
| Agrego TODO y limpio después | Limpieza constante |
| 80% tiempo limpiando | 90% tiempo construyendo bien |
| Código obsoleto por cambios | Código estable porque probé antes |
| UI desorganizada | UI organizada porque código organizado |
| UX confusa | UX clara porque pensé en usuario primero |

---

*Fin de Respuesta #4 - Guía Definitiva Integrada*

---

## 📋 SECCIÓN 8: PREGUNTAS QUE YO ME HARÍA SI FUERAS TÚ

### PREGUNTA #5: ¿Qué más preguntarías en este momento?

Si estuviera en tu lugar, estas son las preguntas adicionales que haría para completar esta guía:

---

## 🎯 LAS PREGUNTAS QUE YO ME HARÍA:

### 1. ¿Cómo manejo DEPENDENCIAS entre features?

**El problema:**
"Quiero agregar feature X, pero depende de feature Y que aún no existe. ¿Qué hago?"

**Mi respuesta:**
```
Si X depende CRÍTICAMENTE de Y:
→ Construye Y primero, aunque sea mínimo

Si X depende PARCIALMENTE de Y:
→ Construye X con una versión "fake" de Y
→ Cuando Y exista, reemplaza la versión fake

Ejemplo:
Quiero "historial de citas" pero aún no existe "citas":
→ Construyo "historial" con datos FAKE
→ Cuando "citas" exista, conecto los datos reales
```

---

### 2. ¿Cuándo sé que es momento de REFACTORIZAR?

**El problema:**
"Siento que mi código está desordenado, pero no sé si debo refactorizar ahora o continuar."

**Mi respuesta:**
```
REFACTORIZA cuando:
☐ Tienes miedo de tocar una parte del código
☐ Cambiar algo requiere modificar 5+ archivos
☐ No entiendes tu propio código de hace 2 semanas
☐ Hay duplicados obvios que ya viste 3 veces

NO refactorices cuando:
❌ Acabas de empezar (es muy pronto)
❌ "Se ve feo pero funciona bien"
❌ Es solo preferencia estética

LA REGLA:
Refactoriza en BLOQUES de 30 min
No pases todo un día refactorizando
```

---

### 3. ¿Cómo DOCUMENTO mi código para entenderlo después?

**El problema:**
"Escribo código, 2 semanas después no entiendo qué hacía. ¿Cómo documentar?"

**Mi respuesta:**
```
NO uses comentarios excesivos:
❌ // Esta función agrega un doctor
   function addDoctor() { }

SÍ usa nombres CLAROS:
✅ function addDoctorToPatientRegistry(patientId: PatientId, doctor: Doctor) { }

Documenta el QUÉ, no el CÓMO:
❌ // Hacemos un loop y verificamos cada elemento
✅ // Filtra doctores disponibles para la fecha seleccionada

Usa JSDoc para funciones complejas:
/**
 * Busca doctores disponibles para una fecha específica
 * @param date - Fecha de la cita (debe ser futura)
 * @param specialty - Especialidad médica requerida
 * @returns Lista de doctores con horarios disponibles
 * @throws InvalidDateError si la fecha es pasada
 */

Crea README.md para cada módulo:
/**
 * @module doctors/service
 * @description Maneja la búsqueda y agendado de doctores
 *
 * Flujo principal:
 * 1. searchDoctors() - Busca por especialidad/ubicación
 * 2. getAvailability() - Obtiene horarios disponibles
 * 3. bookAppointment() - Confirma la cita
 */
```

---

### 4. ¿Cómo decido QUÉ HACER PRIMERO cuando tengo múltiples features pendientes?

**El problema:**
"Tengo 10 features que quiero agregar. ¿Por dónde empiezo?"

**Mi respuesta:**
```
Usa la MATRIZ de IMPACTO x ESFUERZO:

ALTO IMPACTO + BAJO ESFUERZO → HACER PRIMERO ⭐
ALTO IMPACTO + ALTO ESFUERZO → PLANEAR BIEN
BAJO IMPACTO + BAJO ESFUERZO → HACER LUEGO
BAJO IMPACTO + ALTO ESFUERZO → NO HACER (aún)

Ejemplo real:
⭐ "Botón de agendar" (Alto impacto, Bajo esfuerzo)
⭐ "Filtro por especialidad" (Alto impacto, Bajo esfuerzo)
   "Recomendación IA" (Alto impacto, Alto esfuerzo) → Planificar
   "Modo oscuro" (Bajo impacto, Bajo esfuerzo) → Luego
   "Chat con doctor" (Bajo impacto, Alto esfuerzo) → No hacer aún
```

---

### 5. ¿Cómo hago TESTING efectivo sin perder mucho tiempo?

**El problema:**
"Sé que debería probar mi código, pero pierdo mucho tiempo. ¿Cómo hacerlo rápido?"

**Mi respuesta:**
```
NO escribas tests unitarios para TODO:
❌ 100% de coverage = pérdida de tiempo

SÍ escribe tests para LO CRÍTICO:
✅ Flujos principales (agendar, pagar)
✅ Manejo de errores
✅ Validación de datos

La regla del 80/20:
80% del valor de testing viene de 20% de los tests

Enfoque PRÁCTICO:
1. YO MISMO uso el flujo 5 veces
2. Escribo test para LO QUE SE ROMPIÓ
3. NO escribo test para LO QUE NUNCA SE ROMPE

Tests manuales vs automáticos:
- Manual: Para explorar y encontrar bugs
- Automático: Para asegurar que lo arreglado NO se rompa de nuevo
```

---

### 6. ¿Cómo evito "SCOPE CREEP" (el proyecto crece sin control)?

**El problema:**
"Empecé con algo simple y ahora tengo 50 features. ¿Cómo evitar esto?"

**Mi respuesta:**
```
Técnica del "BACKLOG SIEMPRE PRESENTE":

Crea un archivo backlog.md:
```
## MVP (Hacer AHORA)
- ⭐ Buscar doctores
- ⭐ Agendar cita
- ⭐ Pagar

## PRÓXIMA VERSIÓN (Después del MVP)
- Videollamada
- Reseñas
- Historial

## FUTURO (Tal vez nunca)
- Modo oscuro
- Chat en vivo
- Recomendación IA
```

REGLA DE ORO:
Solo trabaja en MIENTRAS está en "MVP"
Cuando algo pase a "PRÓXIMA VERSIÓN", NO lo toques aún

Si tienes una idea nueva:
→ NO la agregues inmediatamente
→ Escríbela en "FUTURO"
- Si en 2 semanas SIGUE pareciendo importante → SÚBELA a PRÓXIMA VERSIÓN
- Si en 2 semanas ya no te importa → BÓRRALA
```

---

### 7. ¿Cómo manejo CAMBIOS en requisitos a mitad del proyecto?

**El problema:**
"Estoy construyendo X y de repente me doy cuenta de que realmente necesito Y. ¿Qué hago?"

**Mi respuesta:**
```
PRIMERO: Evalúa el cambio

¿Es CRÍTICO? (Sin esto, el proyecto no funciona)
   → SÍ: Haz el cambio, pero evalúa el IMPACTO
   → NO: Escríbelo en backlog y continúa

Si es CRÍTICO y debes hacer el cambio:

PASO 1: Mide el IMPACTO
   "Este cambio afecta 3 archivos y me tomará 2 horas"

PASO 2: Decide
   ¿Vale la pena perder 2 horas ahora?
   ¿O puedo hacer una versión "temporal" y arreglarlo después?

PASO 3: Documenta el cambio
   En CHANGELOG.md:
   "2025-02-10: Cambié el flujo de agendado para incluir selección de fecha primero.
   Razón: Los usuarios estaban confundidos al no ver la fecha antes de elegir doctor.
   Impacto: Modifiqué 3 archivos, 2 horas de trabajo."

PASO 4: Ejecuta
   Haz el cambio, PRUÉBALO, y documenta
```

---

### 8. ¿Cómo sé que mi código está "LISTO PARA PRODUCCIÓN"?

**El problema:**
"Siento que mi código nunca está "lo suficientemente bueno". ¿Cuándo está listo?"

**Mi respuesta:**
```
Tu código está LISTO cuando:

MÍNIMO (mínimo viable):
☐ El flujo principal funciona
☐ No hay errores críticos
☐ Un usuario puede completar la tarea principal

RECOMENDADO (para sentirse bien):
☐ El flujo principal funciona BIEN
☐ Los errores están manejados
☐ Hay tests para los flujos críticos
☐ El código está limpio (sin duplicados obvios)
☐ La UI es consistente

IDEAL (polished):
☐ Todo lo anterior
☐ Loading states en todas partes
☐ Mensajes de error claros
☐ Tests de integración
☐ Documentación

LA VERDAD:
Nada está nunca "perfecto"
Lanza en MÍNIMO, mejora en producción
"Done is better than perfect"
```

---

### 9. ¿Cómo mantengo la MOTIVACIÓN cuando el proyecto se siente eterno?

**El problema:**
"Empecé con entusiasmo, pero ahora parece que nunca termino. ¿Cómo seguir motivado?"

**Mi respuesta:**
```
Técnica de "VICTORIAS PEQUEÑAS":

NO te digas:
❌ "Terminar todo el sistema"
❌ "Tener 100 doctores registrados"

SÍ te digas:
✅ "Hoy termino el botón de agendar"
✅ "Esta semana tengo la búsqueda funcionando"
✅ "Este mes el MVP está listo"

Celebra CADA victoria:
- Terminaste una feature → Compártela
- Un usuario usó tu app → Celebra
- Arreglaste un bug difícil → Siéntete bien

Técnica del "PROGRESO VISIBLE":
Mantén un checklist visible:
```
Progreso del proyecto: [████████░░] 80%

☑ Búsqueda de doctores
☑ Agendar cita
☑ Pagos
☐ Videollamada ← AQUÍ ESTAMOS
☐ Reseñas
☐ Historial
```

Ver el progreso te da ENERGÍA para continuar.
```

---

### 10. ¿Cómo decido si CONTINUAR o PIVOTAR?

**El problema:**
"Llevo 3 meses en esto y no estoy seguro si debo continuar o cambiar de rumbo."

**Mi respuesta:**
```
Señales de que debes CONTINUAR:
⭐ Al menos UNA persona usó tu app y le gustó
⭐ Tú MISMO usas tu app y la encuentras útil
⭐ Cada semana haces ALGÚN progreso
⭐ El problema que resuelves sigue siendo REAL

Señales de que debes PIVOTAR:
🚫 Nadie quiere usar tu app (ni siquiera tú)
🚫 Ya no te interesa el problema
🚫 Llevas 1 mes SIN hacer progreso
🚪 Encontraste un problema MÁS grande que vale la pena resolver

LA PRUEBA FINAL:
Si cerraras tu app HOY, ¿alguien extrañaría?
   → SÍ: Continúa
   → NO: Pivota o encuentra un problema real

Recuerda:
El fracaso es aprender qué NO funciona
El verdadero fracaso es continuar en algo que no funciona
```

---

## 📋 RESUMEN: LAS 10 PREGUNTAS ADICIONALES

| # | Pregunta | Respuesta corta |
|---|----------|-----------------|
| 1 | ¿Dependencias entre features? | Construye la dependiente primero o usa versión "fake" |
| 2 | ¿Cuándo refactorizar? | Cuando tienes miedo de tocar código o hay duplicados obvios |
| 3 | ¿Cómo documentar? | Nombres claros > comentarios. JSDoc para funciones complejas |
| 4 | ¿Qué hacer primero? | Matriz Impacto x Esfuerzo. Alto impacto + bajo esfuerzo = primero |
| 5 | ¿Testing efectivo? | 80/20: testea lo crítico, usa tests manuales + automáticos |
| 6 | ¿Evitar scope creep? | Backlog siempre presente. Solo trabaja en MVP |
| 7 | ¿Cambios de requisitos? | Evalúa impacto → Decide → Documenta → Ejecuta |
| 8 | ¿Cuándo está listo? | Mínimo: funciona. Recomendado: funciona bien. Ideal: polished |
| 9 | ¿Mantener motivación? | Victorias pequeñas. Progreso visible. Celebra cada logro |
| 10 | ¿Continuar o pivotar? | ¿Alguien usaría tu app si la cerraras? |

---

*Fin de Respuesta #5 - Preguntas Adicionales*

---

## 🎯 ESTADO FINAL DE LA GUÍA

Esta guía ahora contiene:

1. **Fundamentos** (Sección 1) - Por qué tu enfoque actual no funciona
2. **Proceso paso a paso** (Sección 2) - 9 pasos para construir proyectos
3. **Arquitectura y Diseño** (Sección 3) - UI/UX y calidad visual
4. **Guía Definitiva Integrada** (Sección 7) - TODO en un solo flujo
5. **Preguntas Adicionales** (Sección 8) - 10 preguntas más que yo me haría

**Faltan:**
- Sección 4: Herramientas y Automación *(Pregunta pendiente)*
- Sección 5: Métricas y Monitoreo *(Pregunta pendiente)*
- Sección 6: Patrones y Anti-Patrones *(Pregunta pendiente)*

---

*Última actualización: 2025-02-10*
*Estado: Esperando preguntas del usuario...*

---

## 📋 SECCIÓN 9: GUÍA SINTETIZADA PRÁCTICA (CÓMO YO LO HARÍA)

### PREGUNTA #6: Guía práctica paso a paso para seguir SIN Dudar

**Lo que pides:**
"Escribe la misma guía pero sintetizada y, describiendo cada paso como si tú fueras yo, con las mismas herramientas que yo tengo/uso o las que creas que podría usar. Quiero que esta guía sea algo que yo pueda ver y, partiendo de solo la idea, yo sepa exactamente por dónde empezar y como hacerlo sin dudar ni un momento de lo que estoy haciendo."

---

## 🎯 GUÍA PRÁCTICA: DE IDEA A PRODUCCIÓN EN 8 PASOS

Esta es la guía que yo usaría si estuviera en tu lugar, con tus herramientas (Claude Code, Next.js, Supabase, Vercel).

---

## 📋 PASO 0: PREPARACIÓN (5 minutos)

### Lo que hago ANTES de empezar:

```
1. Abro Claude Code
2. Creo un NUEVO proyecto: mkdir mi-proyecto && cd mi-proyecto
3. Creo estos archivos VACÍOS:
   - touch IDEA.md
   - touch FLUJO.md
   - touch BACKLOG.md
   - touch PROGRESS.md
```

### ¿Por qué?
```
IDEA.md    → Para no olvidar mi idea original
FLUJO.md   → Para dibujar el flujo en texto
BACKLOG.md → Para NO agregar features aleatorias
PROGRESS.md → Para ver mi progreso
```

---

## 📋 PASO 1: DEFINIR LA IDEA (15 minutos)

### Lo que hago en IDEA.md:

```
# MI IDEA

## El problema (1 frase)
Las personas no pueden encontrar doctores cuando están enfermos.

## Para quién
Pacientes en México que necesitan cita URGENTE (no pueden esperar 2 semanas)

## Qué quiero que hagan
Encuentren doctor → Vean perfil → Agenden → Tengan cita

## Por qué es URGENTE
Cuando estás enfermo, cada día cuenta. 2 semanas de espera es inaceptable.
```

### Checklist antes de continuar:
```
☐ El problema está en 1 frase
☐ Sé quién es mi usuario
☐ Sé por qué es urgente
☐ Sé qué hace el usuario
```

---

## 📋 PASO 2: DIBUJAR EL FLUJO (15 minutos)

### Lo que hago en FLUJO.md:

```
# FLUJO DE MI APP

[USUARIO ENTRA]
    ↓
[Ve página de búsqueda]
    ↓
[Escribe especialidad o ciudad]
    ↓
[Ve lista de doctores]
    ↓
[Click en doctor que le interesa]
    ↓
[Ve perfil completo del doctor]
    ↓
[Click "Agendar Cita"]
    ↓
[Selecciona fecha y hora]
    ↓
[Confirma datos]
    ↓
[¡Cita agendada!]
    ↓
[Vuelve al inicio]

DATOS QUE NECESITO:
- Del doctor: nombre, especialidad, precio, ubicación, foto
- Del paciente: nombre, email, teléfono
- De la cita: fecha, hora, motivo
```

### Checklist antes de continuar:
```
☐ El flujo tiene inicio y fin claros
☐ Sé qué datos necesito en cada paso
☐ No pensé aún en tecnología ni diseño visual
```

---

## 📋 PASO 3: DEFINIR EL MVP (10 minutos)

### Lo que hago en BACKLOG.md:

```
# BACKLOG

## MVP - LO ÚNICO QUE HARÉ AL PRINCIPIO

ESTAS son las ÚNICAS cosas en las que trabajo. NO AGREGO NADA MÁS.

- [ ] ⭐ Página de búsqueda de doctores
- [ ] ⭐ Perfil individual de doctor
- [ ] ⭐ Botón "Agendar Cita" ( formulario simple)
- [ ] ⭐ Confirmación por email

DEFINICIÓN DE "TERMINADO":
Un paciente puede buscar, ver perfil, y "agendar" (llega email).

NO HAY:
❌ Pagos reales
❌ Videollamada
❌ Reseñas
❌ Historial
❌ Modo oscuro
❌ NADA que no esté en esta lista

---

## DESPUÉS DEL MVP (Solo si MVP está 100% terminado)

- [ ] Pagos con Stripe
- [ ] Videollamada
- [ ] Reseñas

---

## FUTURO (Ideas, no comprometido)

- Modo oscuro
- Chat en vivo
- Recomendación IA
```

### REGLA DE ORO:
```
SOLO trabajo en MVP.
Si tengo una idea nueva, la escribo en "FUTURO" y SIGO con MVP.
```

---

## 📋 PASO 4: INICIAR EL PROYECTO (10 minutos)

### Lo que hago:

```
1. Inicio Next.js:
   npx create-next-app@latest doctor-mx --typescript --tailwind --app

2. Inicio Supabase:
   - Voy a supabase.com
   - Creo nuevo proyecto "doctor-mx"
   - Copio: PROJECT_URL y ANON_KEY

3. Instalo dependencias:
   npm install @supabase/supabase-js

4. Configuro:
   - Creo .env.local con las variables de Supabase
   - Creo src/lib/supabase/client.ts
```

### Prompt para Claude Code:
```
"Crea la configuración inicial de Supabase para Next.js:
- Crea src/lib/supabase/client.ts con createClient
- Crea .env.local.template con las variables necesarias
NO crees tablas ni componentes aún."
```

---

## 📋 PASO 5: PRIMERA FEATURE - BÚSQUEDA (Día 1)

### Lo que hago:

```
1. Creo la tabla en Supabase:
   - Tabla: doctors
   - Campos: id, name, specialty, price_cents, city, state, photo_url
   - Inserto 3-5 doctors de prueba

2. Pido a Claude:
```

"Crear página de búsqueda de doctores:
- Ruta: /app/doctors/page.tsx
- Fetch: doctors desde Supabase
- Filtros: por especialidad (dropdown) y ciudad (input)
- Muestra: cards con nombre, especialidad, precio, ubicación
- Estilo: usar shadcn/ui Card, Badge, Button
- NO agendar, NO pagos, NO reseñas. Solo búsqueda y lista."
```

3. Pruebo:
```
npm run dev
Voy a http://localhost:3000/doctors
Pruebo buscar "cardiología"
Pruebo filtrar por ciudad
```

4. NO paso a lo siguiente hasta que funcione.

---

## 📋 PASO 6: SEGUNDA FEATURE - PERFIL (Día 2)

### Lo que hago:

```
1. Creo ruta dinámica:
   mkdir -p app/doctors/[id]

2. Pido a Claude:
```

"Crear página de perfil de doctor:
- Ruta: /app/doctors/[id]/page.tsx
- Fetch: doctor por ID desde Supabase
- Muestra: foto, nombre, especialidad, precio, ciudad, descripción
- Botón: 'Agendar Cita' (grande, visible)
- Estilo: shadcn/ui components
- Si doctor no existe: mostrar 404"
```

3. Pruebo:
```
Voy a /doctors/1 (debe existir)
Voy a /doctors/999 (debe dar 404)
Click en "Agendar" debe... llevar a alguna parte (aún no existe)
```

---

## 📋 PASO 7: TERCERA FEATURE - AGENDAR (Día 3-4)

### Lo que hago:

```
1. Creo tabla en Supabase:
   - Tabla: appointments
   - Campos: id, doctor_id, patient_name, patient_email, date, time

2. Pido a Claude:
```

"Crear flujo de agendado:
Paso 1 - Modal en perfil de doctor:
- Al click "Agendar", abre modal con:
  - Nombre (input)
  - Email (input)
  - Fecha (date picker)
  - Hora (time picker)
  - Botón "Confirmar"

Paso 2 - API route:
- /app/api/appointments/route.ts
- POST: crea appointment en Supabase
- Envía email de confirmación (usando Resend)

Paso 3 - Confirmación:
- Después de agendar, mostrar mensaje de éxito
- Redirigir a /doctors después de 3 segundos"
```

3. Pruebo el flujo COMPLETO:
```
Buscar doctor → Ver perfil → Click Agendar → Llenar formulario → Confirmar → Ver mensaje de éxito
```

---

## 📋 PASO 8: TESTING Y LIMPIEZA (Día 5)

### Lo que hago:

```
1. Testing MANUAL (yo uso la app 5 veces):

Intento 1: Busco "cardiólogo" → Agendo
Intento 2: Busco por ciudad → Agendo
Intento 3: Busco doctor que no existe → No debe romper
Intento 4: Agendo con email inválido → Debe mostrar error
Intento 5: Agendo con fecha pasada → Debe mostrar error

2. Anoto lo que se rompió:
```

PROBLEMAS ENCONTRADOS:
- [ ] El loading no se ve
- [ ] Si el email es inválido, la app se rompe
- [ ] No sé cuándo se agendó correctamente
```

3. Pido a Claude arreglar los problemas:
```
"Arreglar estos problemas:
- Agregar loading state mientras busca doctores
- Validar email antes de enviar (usar Zod)
- Mostrar toast de confirmación cuando se agende"
```

4. Limpieza rápida:
```
- ¿Hay código que no uso? → Lo borro
- ¿Hay nombres confusos? → Los renombro
- ¿Hay duplicados? → Los uno
```

---

## 📋 PASO 9: CHECKLIST ANTES DE "TERMINAR"

```
☐ El flujo COMPLETO funciona 5 veces seguidas
☐ Un amigo/a lo probó sin mi ayuda
☐ No hay errores en consola
☐ No hay tipos `any`
☐ No hay `console.log` en código
☐ El loading se ve
☐ Los errores tienen mensajes claros
☐ La UI se ve decente en móvil

→ SI TODO LO ANTERIOR: MVP TERMINADO
→ SI NO: Arreglo lo que falta
```

---

## 📋 PASO 10: PRÓXIMA FEATURE (Solo después de MVP terminado)

```
1. Elijo la SIGUIENTE cosa más importante del BACKLOG
2. Repito el proceso: Definir → Construir → Probar → Limpiar
3. NO trabajo en 2 features a la vez
```

---

## 🎯 RESUMEN: MI DÍA A DÍA

### Día 1: Definición + Setup
```
- Escribo IDEA.md
- Escribo FLUJO.md
- Escribo BACKLOG.md
- Inicio proyecto Next.js
- Configuro Supabase
```

### Día 2: Búsqueda
```
- Creo tabla doctors en Supabase
- Creo página /doctors
- Creo filtros
- Pruebo hasta que funcione
```

### Día 3: Perfil
```
- Creo /doctors/[id]
- Muestro datos del doctor
- Botón "Agendar"
- Pruebo hasta que funcione
```

### Día 4: Agendar
```
- Creo tabla appointments
- Creo modal de agendado
- Creo API route
- Pruebo flujo completo
```

### Día 5: Testing y Limpieza
```
- Uso la app 5 veces
- Un amigo la prueba
- Arreglo problemas
- Limpio código
```

### Semana 2: Pagos (si MVP funciona)
### Semana 3: Videollamada (si pagos funciona)
### Y así...

---

## 🔥 LAS REGLAS QUE YO SIGO:

```
1. UNA feature a la vez
2. Pruebo ANTES de continuar
3. NO agrego nada que no esté en BACKLOG.md
4. Limpio código cada 3 días
5. Si dudo más de 5 minutos, pregunto a Claude
```

---

## 📁 ESTRUCTURA FINAL:

```
mi-proyecto/
├── IDEA.md           ← Mi idea original
├── FLUJO.md          ← El flujo que dibujé
├── BACKLOG.md        ← Solo trabajo en MVP
├── PROGRESS.md       ← Mi progreso
├── .env.local        ← Variables de entorno
├── src/
│   ├── app/
│   │   ├── doctors/
│   │   │   ├── page.tsx          ← Búsqueda
│   │   │   └── [id]/
│   │   │       └── page.tsx      ← Perfil
│   │   └── api/
│   │       └── appointments/
│   │           └── route.ts      ← Agendar
│   └── lib/
│       └── supabase/
│           └── client.ts         ← Conexión Supabase
└── package.json
```

---

## 💡 PROMPTS QUE YO USO CON CLAUDE:

```
1. Para iniciar:
"Crea un proyecto Next.js con TypeScript, Tailwind, y App Router.
Configura Supabase para conectar a una base de datos existente."

2. Para una feature:
"Crea [X feature] con estas especificaciones:
- Ruta: /app/[ruta]
- Componentes: usar shadcn/ui
- Estilo: limpio, minimalista
- NO incluir: [lista de cosas que NO quiero]"

3. Para arreglar bugs:
"Este código tiene el siguiente problema: [descripción].
Arréglalo manteniendo la estructura actual."

4. Para refactorizar:
"Este código está duplicado en estos archivos: [lista].
Extrae la lógica común a un archivo reutilizable."
```

---

## 🚀 DEPLOY (Cuando MVP esté listo):

```
1. Push a GitHub:
   git init
   git add .
   git commit -m "MVP: búsqueda, perfil, agendar"
   git push origin main

2. Deploy en Vercel:
   - Voy a vercel.com
   - Importo desde GitHub
   - Configuro environment variables
   - Deploy

3. Pruebo en producción:
   - Voy a la URL de Vercel
   - Pruebo el flujo completo
   - Comparto con amigos
```

---

*Fin de Sección 9 - Guía Práctica*

---

## 📊 ÍNDICE FINAL DE CONTENIDO:

| Sección | Contenido | Estado |
|---------|----------|--------|
| 1 | Fundamentos - Por qué tu enfoque no funciona | ✅ Completo |
| 2 | Proceso paso a paso - 9 pasos | ✅ Completo |
| 3 | Arquitectura y Diseño - UI/UX | ✅ Completo |
| 4 | Herramientas y Automación | ⏳ Pendiente |
| 5 | Métricas y Monitoreo | ⏳ Pendiente |
| 6 | Patrones y Anti-Patrones | ⏳ Pendiente |
| 7 | GUÍA DEFINITIVA INTEGRADA | ✅ Completo |
| 8 | 10 Preguntas Adicionales | ✅ Completo |
| 9 | GUÍA PRÁCTICA (CÓMO YO LO HARÍA) | ✅ Completo |

---

*Documento actualizado: 2025-02-10*
*Total: ~2100 líneas de guía detallada*

---

## 📋 SECCIÓN 10: HERRAMIENTAS DE IA MODERNA - POTENCIANDO EL PROCESO

### PREGUNTA #7: ¿Qué son los pendientes y cómo usar IA moderna (multi-agents, swarms) para potenciar el proceso?

---

## 📋 PARTE 1: ¿QUÉ SON LOS "PENDIENTES"?

Los "pendientes" en las secciones 4, 5 y 6 son temas que aún no hemos explorado juntos. Son importantes pero NO son esenciales para empezar:

```
⏳ Sección 4: Herramientas y Automación
   → Scripts, CLIs, GitHub Actions, testing automático
   → ÚTIL: Pero NO lo necesitas para el MVP

⏳ Sección 5: Métricas y Monitoreo
   → Analytics, error tracking (Sentry), performance monitoring
   → ÚTIL: Pero NO lo necesitas para el MVP

⏳ Sección 6: Patrones y Anti-Patrones
   → Patrones de diseño comunes, errores típicos
   → ÚTIL: Pero ya cubrimos mucho en otras secciones
```

**Por qué están pendientes:**
- Nos enfocamos en lo CRÍTICO primero (Secciones 1-3, 7-9)
- Estos temas son "nice to have" para cuando tengas más experiencia
- Si los necesitas específicamente, ¡pregúntame y los completo!

---

## 📋 PARTE 2: CÓMO USAR IA MODERNA PARA POTENCIAR EL PROCESO

Aquí está cómo usaría TODAS las herramientas de IA modernas para hacer este proceso 10x más poderoso:

---

## 🤖 ESTRATEGIA 1: MULTIPLE AGENTS (Especialización)

### El concepto:
**En lugar de UN solo agente haciendo TODO, usa VARIOS agentes especializados.**

### Arquitectura de agentes para un proyecto:

```
                    ┌─────────────────┐
                    │   USER (TÚ)    │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
         ┌──────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
         │ ARCHITECT   │ │BUILDER  │ │REVIEWER    │
         │ AGENT       │ │AGENT    │ │AGENT       │
         └─────────────┘ └─────────┘ └─────────────┘
                │            │            │
         ┌─────▼─────┐  ┌──▼─────┐  ┌──▼──────┐
         │Planning   │  │Code    │  │Quality  │
         │Research   │  │Tests   │  │Security  │
         └───────────┘  │UI/UX   │  │Docs     │
                       └────────┘  └─────────┘
```

### Cómo implementarlo con Claude Code:

```
// PROMPT PARA EL ARCHITECT AGENT
"Eres el ARCHITECTO. Tu trabajo es:
1. Analizar mi idea y decirme QUÉ construir
2. NO escribir código
3. Solo planear: estructuras, rutas, datos necesarios
4. Entregar: un plan claro en pasos"

// PROMPT PARA EL BUILDER AGENT
"Eres el BUILDER. Tu trabajo es:
1. Recibir el plan del ARCHITECT
2. Escribir el código según el plan
3. SOLO escribir lo que el plan dice
4. NO agregar cosas extra"

// PROMPT PARA EL REVIEWER AGENT
"Eres el REVIEWER. Tu trabajo es:
1. Revisar el código del BUILDER
2. Buscar: bugs, code smells, problemas de seguridad
3. Sugerir mejoras específicas
4. NO reescribir todo, solo criticar constructivamente"
```

### En la práctica (tu flujo):

```
DÍA 1:
1. Hablas con ARCHITECT → Obtienes plan
2. Das plan a BUILDER → Obtienes código
3. Das código a REVIEWER → Obtienes feedback
4. Aplicas feedback → Código listo

DÍA 2:
Repetir con siguiente feature
```

---

## 🐝 ESTRATEGIA 2: SWARM AGENTS (Paralelización)

### El concepto:
**Varios agentes trabajando EN PARALELO en diferentes partes del proyecto.**

### Arquitectura de swarm:

```
                         ┌─────────────────┐
                         │   USER (TÚ)    │
                         └────────┬────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
             ┌──────▼──────┐ ┌───▼────┐ ┌─────▼─────┐
             │ FRONTEND    │ │BACKEND │ │TESTING    │
             │ SQUAD       │ │SQUAD   │ │SQUAD      │
             └─────────────┘ └────────┘ └───────────┘
             │      │       │    │        │     │
         ┌───▼──┬▼──┬──▼──┐ ┌▼──┬▼──┐ ┌──▼──┬▼──┬▼──┐
         │Page │Comp│Hook│ │API│DB │ │E2E │Unit│Perf│
         └─────┴───┴────┘ └───┴───┘ └────┴───┴────┘
```

### Cómo implementarlo:

```
// Swarm para feature "Agendar Cita"

SQUAD 1 - Frontend (trabaja en paralelo):
  Agente A: Modal de agendado
  Agente B: Formulario con validación
  Agente C: Loading states y errores

SQUAD 2 - Backend (trabaja en paralelo):
  Agente D: API route para crear cita
  Agente E: Validación en servidor
  Agente F: Email de confirmación

SQUAD 3 - Testing (trabaja en paralelo):
  Agente G: Tests E2E del flujo
  Agente H: Tests unitarios de validación
  Agente I: Tests de integración

TODOS trabajan al mismo tiempo.
TÚ solo integras los resultados.
```

### Prompt para swarm:

```
"Divide esta tarea en 3 equipos que trabajan en paralelo:

EQUIPO FRONTEND:
- Agente 1: Crear modal con shadcn/ui Dialog
- Agente 2: Crear formulario con validación Zod
- Agente 3: Crear loading y error states

EQUIPO BACKEND:
- Agente 4: Crear API route /api/appointments
- Agente 5: Crear validación de servidor
- Agente 6: Crear servicio de email

EQUIPO TESTING:
- Agente 7: Crear test E2E del flujo
- Agente 8: Crear tests unitarios

Cada agente escribe SU parte.
Luego tú integras todo."
```

---

## 🔄 ESTRATEGIA 3: MULTI-MODELO ENSEMBLE (Diversidad)

### El concepto:
**Diferentes modelos de IA tienen diferentes fortalezas. ÚSALOS TODOS.**

### Matriz de modelos y fortalezas:

```
┌─────────────┬──────────────┬─────────────────┬────────────────┐
│ MODELO      │ MEJOR PARA   │ EJEMPLO USO     │ CUÁNDO USAR    │
├─────────────┼──────────────┼─────────────────┼────────────────┤
│ Claude 4.6  │ Code quality │ Refactorizar    │ Código complejo│
│ (Opus)      │ Architecture │ Diseñar sistema │ Planificación  │
│             │ Explanation │ Entender código │ Debug difícil  │
├─────────────┼──────────────┼─────────────────┼────────────────┤
│ GPT-4o      │ Speed        │ Code rápido     │ Prototipado    │
│             │ UI/UX        │ Componentes     │ CSS/Tailwind   │
│             │ Creatividad  │ Brainstorming   │ Ideas          │
├─────────────┼──────────────┼─────────────────┼────────────────┤
│ Gemini 2.5  │ Research     │ Documentación   │ Aprender tech   │
│             │ Long context │ Análisis largo  │ Código extenso  │
│             │ Multimodal   │ Imágenes        │ Vision         │
├─────────────┼──────────────┼─────────────────┼────────────────┤
│ DeepSeek    │ Coding       │ Algoritmos      │ Lógica densa   │
│             │ Math         │ Cálculos        │ Optimización   │
│             │ Chinese/ES   │ Localización    │ Idiomas        │
├─────────────┼──────────────┼─────────────────┼────────────────┤
│ Llama 3.3   │ Privacy      │ Local code      │ Datos sensibles│
│ (Local)     │ Free         │ Sin API key     │ Offline        │
└─────────────┴──────────────┴─────────────────┴────────────────┘
```

### Estrategia ensemble en la práctica:

```
// PASO 1: Planning con Claude 4.6
"Quiero construir sistema de citas. Ayúdame a planear:
- Qué features primero
- Qué arquitectura usar
- Qué datos necesito"

// PASO 2: Prototipado rápido con GPT-4o
"Basado en este plan, crea código RÁPIDO para:
- Página de búsqueda (Next.js + Tailwind)
- No te preocupes por calidad, solo que funcione"

// PASO 3: Research con Gemini
"Investiga las mejores prácticas para:
- Citas médicas online
- Compliance en México
- Ejemplos de sistemas similares"

// PASO 4: Refactorización con Claude 4.6
"Este código funciona pero es desordenado. Refactóralo:
- Mejora nombres
- Extrae funciones
- Optimiza queries"

// PASO 5: Local testing con Llama (opcional)
"Corre tests localmente y reporta resultados"
```

---

## 🧠 ESTRATEGIA 4: CROSSED FEEDBACK (Retroalimentación cruzada)

### El concepto:
**Diferentes modelos revisan el MISMO problema y tú comparas las respuestas.**

### Proceso de crossed feedback:

```
TU PREGUNTA: "¿Cómo implementar pagos con Stripe?"

┌─────────────────────────────────────────┐
│ CLAUDE 4.6                              │
│ - Enfoque: Arquitectura robusta        │
│ - Respuesta: Sistema modular con hooks  │
│ - Ventaja: Escalable, mantenible        │
└─────────────────────────────────────────┘
                    ↕ COMPARAS
┌─────────────────────────────────────────┐
│ GPT-4o                                  │
│ - Enfoque: Rapidez de implementación    │
│ - Respuesta: Stripe Checkout simplificado│
│ - Ventaja: Funciona rápido               │
└─────────────────────────────────────────┘
                    ↕ COMPARAS
┌─────────────────────────────────────────┐
│ Gemini 2.5                              │
│ - Enfoque: Documentación completa       │
│ - Respuesta: Guía paso a paso con links  │
│ - Ventaja: Aprendes mucho               │
└─────────────────────────────────────────┘

TU DECISIÓN: "Usaré Checkout de GPT-4o por rapidez,
              pero estructura de Claude para futuro."
```

### Prompt para crossed feedback:

```
"Haz la misma pregunta a 3 modelos diferentes:

Pregunta: [Tu pregunta]

Modelo 1 (Claude): [Respuesta]
Modelo 2 (GPT): [Respuesta]
Modelo 3 (Gemini): [Respuesta]

Analiza las 3 respuestas y dime:
1. ¿En qué coinciden?
2. ¿En qué difieren?
3. ¿Cuál enfoque es mejor para MI situación?
4. ¿Puedo combinar lo mejor de los 3?"
```

---

## 🎯 ESTRATEGIA 5: EL FLUJO IDEAL CON IA MODERNA

### Mi flujo ideal usando TODAS las estrategias:

```
FASE 1: PLANNING (Claude 4.6 - Architect)
┌─────────────────────────────────────────┐
│ 1. Claude Architect                     │
│    → Analiza idea                        │
│    → Crea plan detallado                 │
│    → Define arquitectura                 │
└─────────────────────────────────────────┘
              ↓ Plan listo

FASE 2: CROSS-VALIDATION (Ensemble)
┌──────────┬──────────┬──────────┐
│ GPT-4o   │ Gemini  │ DeepSeek │
│ Revisa   │ Revisa  │ Revisa   │
│ plan     │ plan    │ plan     │
└──────────┴──────────┴──────────┘
              ↓ Consenso

FASE 3: SWARM BUILDING (Paralelo)
┌─────────────────────────────────────────┐
│ SQUAD FRONTEND (GPT-4o - rápido)        │
│  → Agente A: Página búsqueda            │
│  → Agente B: Cards de doctores          │
│  → Agente C: Modal agendar              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SQUAD BACKEND (Claude 4.6 - calidad)    │
│  → Agente D: API routes                 │
│  → Agente E: Database schema            │
│  → Agente F: Validations                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ SQUAD TESTING (Gemini - completo)       │
│  → Agente G: E2E tests                  │
│  → Agente H: Unit tests                 │
│  → Agente I: Documentation              │
└─────────────────────────────────────────┘
              ↓ Código listo

FASE 4: REVIEW (Claude 4.6 - crítico)
┌─────────────────────────────────────────┐
│ Claude Reviewer                         │
│  → Revisa TODO el código                │
│  → Busca bugs, security, performance   │
│  → Sugiere refactorizaciones            │
└─────────────────────────────────────────┘
              ↓ Código quality

FASE 5: INTEGRACIÓN (Tú)
┌─────────────────────────────────────────┐
│ TÚ integras:                            │
│  → Código de los squads                 │
│  → Feedback del reviewer                │
│  → Testing manual                       │
│  → Deploy                               │
└─────────────────────────────────────────┘
```

---

## 🛠️ HERRAMIENTAS ESPECÍFICAS QUE USARÍA:

### 1. Para Orquestación:
```
- Claude Code (lo que ya usas) → Para control general
- LangChain / LangGraph → Para flujos multi-agente complejos
- CrewAI → Para swarms especializados
- AutoGen → Para agentes conversando entre sí
```

### 2. Para Code:
```
- Cursor (IDE con IA) → Para code completion
- GitHub Copilot → Para snippets rápidos
- Continue.dev → Para chat en VS Code
```

### 3. Para Review:
```
- Claude 4.6 → Para código complejo
- GPT-4o → Para quick fixes
- DeepSeek → Para lógica densa
```

### 4. Para Testing:
```
- E2E: Playwright (con AI test generation)
- Unit: Vitest (con AI test suggestions)
- Visual: Percy (con AI visual diff)
```

### 5. Para Docs:
```
- Notion AI → Para documentación
- Mintlify → Para API docs autogenerados
- Swizzle → Para Storybook con AI
```

---

## 📋 EJEMPLO PRÁCTICO: Feature "Agendar Cita"

### Con agentes tradicionales (tu enfoque anterior):
```
Tú → 1 prompt gigante → 1 IA → Código desordenado → Tú limpias todo
Tiempo: 2 días de limpieza
```

### Con IA moderna (mi enfoque recomendado):
```
MINUTO 0-10:
  Tú → Claude Architect → Plan detallado

MINUTO 10-30:
  Plan → 3 modelos (GPT, Gemini, DeepSeek) → 3 perspectivas
  Tú → Comparas → Decides enfoque híbrido

MINUTO 30-90:
  Enfoque → 3 squads en paralelo:
  - Frontend (GPT-4o) → Componentes UI
  - Backend (Claude) → API y lógica
  - Testing (Gemini) → Tests

MINUTO 90-120:
  Todo → Claude Reviewer → Feedback específico
  Tú → Aplicas críticas

MINUTO 120-150:
  Tú → Testing manual → Integración final
  Tú → Deploy

Tiempo total: 2.5 horas
Resultado: Código quality desde el inicio
```

---

## 🔥 LA VERDAD SOBRE IA MODERNA:

```
❌ NO necesitas:
   - Todos los agentes a la vez
   - Orquestación compleja desde el día 1
   - Gastar fortuna en APIs

✅ Sí necesitas:
   - Empezar con 1 arquitecto + 1 builder
   - Agregar más agentes según necesidad
   - Aprovechar fortalezas de cada modelo
   - Cross-validar decisiones importantes
```

---

## 📈 ROADBLOCK DE ADOPCIÓN:

```
SEMANA 1:
  → Solo TÚ + 1 Agente (Claude Architect)
  → Objetivo: Aprender a trabajar con IA

SEMANA 2:
  → +1 Agente (Builder)
  → Objetivo: Especialización

SEMANA 3:
  → +1 Agente (Reviewer)
  → Cross-validation entre modelos
  → Objetivo: Calidad

SEMANA 4:
  → Swarms para features complejas
  → Objetivo: Velocidad

SEMANA 5+:
  → Automatización con orquestadores
  → Objetivo: Escala
```

---

## 🎯 PROMPT LISTO PARA COPIAR:

```
// MULTI-AGENTE MASTER PROMPT
"Quiero construir [FEATURE] usando múltiples agentes especializados:

1. ARCHITECT (Claude 4.6):
   Planifica la arquitectura
   NO escribas código
   Entrega: estructura, datos, flujos

2. BUILDER (GPT-4o):
   Recibe el plan del Architect
   Escribe código RÁPIDO
   Enfócate en que funcione

3. REVIEWER (Claude 4.6):
   Revisa el código del Builder
   Busca: bugs, security, performance
   Sugiere mejoras específicas

Workflow:
- Yo hablo con Architect → obtengo plan
- Doy plan a Builder → obtengo código
- Doy código a Reviewer → obtengo feedback
- Yo aplico feedback → código final

Comienza siendo ARCHITECT."
```

---

*Fin de Sección 10 - Herramientas de IA Moderna*

---

## 📋 SECCIÓN 11: DEEP RESEARCH - CUÁNDO Y CÓMO USARLO SIN CAER EN LA TRAMPA

### PREGUNTA #8: ¿Cuándo y cómo usar Deep Research (swarms, web search, GitHub analysis) sin caer en la trampa de investigar demasiado?

---

## 🎯 LA VERDAD SOBRE DEEP RESEARCH:

**El deep research es como una navaja suiza:**
- ✅ Poderosísima cuando se usa en el MOMENTO CORRECTO
- ❌ Peligrosísima cuando se usa en el momento INCORRECTO

**El error que mencionamos al inicio:**
> "Haces 'deep research' antes de saber QUÉ necesitas investigar"
> "Es como comprar muebles para una casa que no has diseñado aún"

---

## 📋 CUÁNDO USAR DEEP RESEARCH (Los 5 momentos correctos):

### MOMENTO 1: ANTES DE DEFINIR EL PROBLEMA (Research de contexto)

**Cuándo:** Antes de escribir una sola línea de código, DESPUÉS de tener la idea básica

**Qué investigar:**
```
- ¿El problema REALMENTE existe?
- ¿Cómo lo resuelven HOY las personas?
- ¿Qué soluciones ya existen?
- ¿Qué NO les gusta de las soluciones actuales?
```

**Prompt para Deep Research:**
```
"Investiga sobre [TU PROBLEMA]:

1. Busca EN Reddit, Hacker News, foros especializados:
   - ¿Qué se queja la gente?
   - ¿Qué soluciones usan?
   - ¿Qué NO les gusta?

2. Busca en Google:
   - "mejor app para [problema]"
   - "alternativas a [solución popular]"
   - "[problema] solución"

3. Busca en Product Hunt:
   -Productos similares
   - Reviews y quejas

4. Entrega: Reporte con:
   - ¿El problema es REAL?
   - ¿Qué soluciones existen?
   - ¿Qué huecos hay en el mercado?"
```

**Duración:** 30-60 minutos
**No más porque:** Aún no sabes QUÉ vas a construir

---

### MOMENTO 2: ANTES DE ELEGIR STACK (Research técnico)

**Cuándo:** Después de definir el problema, ANTES de elegir tecnología

**Qué investigar:**
```
- ¿Qué usan proyectos SIMILARES?
- ¿Qué stack es el estándar?
- ¿Qué problemas tuvo la gente con X stack?
- ¿Qué combina mejor con lo que ya sé?
```

**Prompt para Deep Research:**
```
"Investiga STACK para [TU TIPO DE PROYECTO]:

1. GitHub:
   - Busca repositorios con 1000+ estrellas similares a [tu idea]
   - ¿Qué stack usan?
   - ¿Qué issues frecuentes tienen?

2. Reddit/HackerNews:
   - "[stack] vs [stack] para [tu caso]"
   - ¿Qué recomiendan?
   - ¿Qué PROBLEMAS tiene cada stack?

3. Stack Overflow:
   - Preguntas frecuentes sobre [stack candidato]
   - ¿Hay problemas sin solución?

4. Entrega: Recomendación de stack con:
   - Opción A (la que todos usan)
   - Opción B (innovadora pero riesgosa)
   - Qué evitar y por qué"
```

**Duración:** 1-2 horas
**No más porque:** Ya tienes suficiente info para decidir

---

### MOMENTO 3: ANTES DE CONSTRUIR FEATURE COMPLEJA (Research de implementación)

**Cuándo:** Cuando vas a construir algo que no has hecho antes

**Qué investigar:**
```
- ¿Cómo lo resolvieron otros?
- ¿Qué patrones usaron?
- ¿Qué evitaron?
- ¿Código de ejemplo?
```

**Prompt para Deep Research:**
```
"Investiga implementación de [FEATURE]:

1. GitHub:
   - Busca repos que tengan [feature]
   - Lee el código de 3-5 ejemplos
   - ¿Qué patrones se repiten?

2. Documentación:
   - Documentación oficial de [tecnología]
   - Guías "best practices"

3. Stack Overflow:
   - "[feature] implementation issues"
   - ¿Qué errores comunes?

4. Entrega:
   - Código de ejemplo (2-3 approaches)
   - Qué evitar (errores comunes)
   - Recomendación específica para MI caso"
```

**Duración:** 2-3 horas
**No más porque:** Ya tienes suficientes referencias

---

### MOMENTO 4: ANTES DE DECISIÓN IMPORTANTE (Research de validación)

**Cuándo:** Cuando tienes que decidir entre 2+ caminos importantes

**Qué investigar:**
```
- ¿Qué elegieron otros en mi situación?
- ¿Qué resultado tuvieron?
- ¿Lo harían de nuevo?
```

**Prompt para Deep Research:**
```
"Tengo que decidir entre [Opción A] y [Opción B]:

Contexto: [Tu situación específica]

Investiga:

1. Casos de estudio:
   - ¿Quién usó [Opción A]?
   - ¿Quién usó [Opción B]?
   - ¿Qué resultado tuvieron?

2. Post-mortems:
   - "arrepentimiento de elegir [Opción]"
   - "lessons learned using [opción]"

3. Comparaciones directas:
   - "[Opción A] vs [Opción B]"
   - Pros y cons de cada una

4. Entrega: Recomendación con evidencia"
```

**Duración:** 1 hora
**No más porque:** Necesitas decidir y seguir

---

### MOMENTO 5: CUANDO ESTÁS ATASCADO (Research de solución)

**Cuándo:** Cuando llevas 1+ día atascado en el mismo problema

**Qué investigar:**
```
- ¿Alguien más tuvo este problema?
- ¿Cómo lo resolvió?
- ¿Hay solución alternativa?
```

**Prompt para Deep Research:**
```
"Estoy atascado con [PROBLEMA]:

Contexto: [Qué estás haciendo, qué intentaste]

Investiga:

1. GitHub Issues:
   - Repositorios similares con [problema]
   - ¿Cómo lo resolvieron?

2. Stack Overflow:
   - Pregunta exacta de tu problema
   - Respuestas con +10 votos

3. Documentación:
   - Oficial de [tecnología]
   - "troubleshooting [problema]"

4. Reddit/Foros:
   - "[problema] help"

5. Entrega: 3-5 posibles soluciones para probar"
```

**Duración:** 30 minutos - 1 hora
**No más porque:** Si no encuentras en 1 hora, haz la pregunta tú

---

## 🚫 CUÁNDO NO USAR DEEP RESEARCH:

```
❌ ANTES de tener una idea clara
   → No sabes qué buscar

❌ CUANDO estás en "modo exploración" de código
   → Codea primero, research si necesitas

❌ PARA procrastinar
   → Research es fácil, codear es difícil

❌ PARA validar tu ego
   → "Mira cuánto sé sobre X tema"

❌ CUANDO la respuesta es OBVIA
   → No necesitas research para elegir PostgreSQL vs MySQL

❌ CUANDO ya tienes suficiente información
   → Más info = más confusión, no más claridad
```

---

## 🤖 CÓMO USAR SWARMS Y MULTI-AGENTES PARA RESEARCH:

### Estrategia 1: Swarm de Research (Kimi-style)

**Qué es:** Varios agentes especializados investigando diferentes ángulos

**Cómo implementarlo:**

```
TAREA: "Investigar sobre sistema de citas médicas"

SWARM DE AGENTES:

🕵️ Agente 1 - Researcher de MERCADO:
   - Tamaño del mercado
   - Competidores principales
   - Precios promedio
   - Tendencias

🕵️ Agente 2 - Researcher TÉCNICO:
   - Stack tecnológico de competidores
   - APIs disponibles (Stripe, Twilio, etc.)
   - Regulaciones médicas (México)
   - Security requirements

🕵️ Agente 3 - Researcher de UX:
   - Patrones de diseño en apps médicas
   - What users hate about current apps
   - Best practices para citas médicas
   - Accessibility requirements

🕵️ Agente 4 - Researcher GITHUB:
   - Repositorios open source similares
   - Code patterns que se repiten
   - Librerías útiles
   - Licencias

🕵️ Agente 5 - Researcher LEGAL:
   - Regulaciones en México
   - Compliance médico
   - Data protection (GDPR, local laws)
   - Términos de servicio ejemplos

TU ROL: Integrar findings y decidir qué usar
```

### Prompt para Swarm Research:

```
"Necesito deep research sobre [TEMA] usando un swarm de agentes:

Crea 5 agentes especializados que investiguen en paralelo:

AGENTE 1 - Mercado:
  - Tamaño, competidores, precios, tendencias

AGENTE 2 - Técnico:
  - Stack, APIs, regulaciones, security

AGENTE 3 - UX:
  - Patrones, what users hate, best practices

AGENTE 4 - GitHub:
  - Repos open source, code patterns, librerías

AGENTE 5 - Legal:
  - Regulaciones, compliance, data protection

Cada agente debe:
1. Buscar en lugares específicos (Reddit, GitHub, Google, etc.)
2. Extraer 5-10 findings clave
3. Citar fuentes

Entrega: Reporte consolidado con findings de los 5 agentes."
```

---

### Estrategia 2: GitHub Analysis Research

**Qué es:** Análisis profundo de repositorios similares para aprender de lo que ya funciona

**Cómo implementarlo:**

```
PASO 1: Encontrar repositorios relevantes
```

"Busca en GitHub repositorios que tengan:
- +1000 estrellas
- 'doctor' OR 'medical' OR 'appointment' en el nombre
- Actualizado en los últimos 6 meses
- Licencia permisiva (MIT, Apache)

Lista top 10 con URL y descripción."
```

**PASO 2: Analizar arquitectura**

```
"Para cada repo de la lista:

1. Lee la estructura de carpetas
2. Identifica:
   - Qué framework usan
   - Cómo estructuran routes
   - Cómo manejan auth
   - Qué database usan
   - Qué testing usan

3. Busca PATRONES que se repitan en 3+ repos
4. ¿Qué evitan todos? (probablemente mala idea)"
```

**PASO 3: Extraer código de inspiración**

```
"Para [FEATURE específica]:

1. Busca implementación en 3+ repos
2. Compara:
   - Approach 1: [descripción]
   - Approach 2: [descripción]
   - Approach 3: [descripción]

3. ¿Cuál es el MÁS usado?
4. ¿Por qué será?
5. Código de ejemplo del approach ganador"
```

---

### Estrategia 3: Cross-Model Research Ensemble

**Qué es:** Mismo research prompt, diferentes modelos, tú comparas

**Cómo implementarlo:**

```
PREGUNTA: "¿Cuál es el mejor stack para app de citas médicas?"

┌─────────────────────────────────────────┐
│ CLAUDE 4.6 (Research)                   │
│ - Búsqueda profunda                     │
│ - Análisis detallado                    │
│ - Fuentes confiables                    │
│ - Enfoque: Arquitectura robusta         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ GPT-4o (Research)                       │
│ - Búsqueda rápida                       │
│ - Ejemplos actuales                     │
│ - Enfoque: Lo que está funcionando AHORA │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ GEMINI (Research)                       │
│ - Contexto largo                       │
│ - Muchas fuentes                       │
│ - Enfoque: Completitud                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PERPLEXITY (Search)                     │
│ - Búsqueda en tiempo real               │
│ - Fuentes actuales                      │
│ - Enfoque: Información latest            │
└─────────────────────────────────────────┘

TU: Comparas y decides
```

---

## 📋 SECCIÓN 4: HERRAMIENTAS Y AUTOMACIÓN (COMPLETADA)

### Herramientas esenciales para tu flujo:

```
🔧 Para INICIAR proyectos:
   - npx create-next-app@latest
   - npm create vite@latest
   - Degit (para clonar templates)

🔧 Para CALIDAD de código:
   - ESLint (linting)
   - Prettier (formatting)
   - Husky (git hooks)
   - lint-staged (pre-commit)

🔧 Para TESTING:
   - Vitest (unit tests)
   - Playwright (E2E tests)
   - Zod (validación en runtime)

🔧 Para DEPLOY:
   - Vercel (Next.js)
   - Railway/Render (backend)
   - Supabase (database)

🔧 Para MONITOREO:
   - Sentry (errors)
   - Vercel Analytics
   - Posthog (product analytics)
```

### Scripts útiles para package.json:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next node_modules"
  }
}
```

---

## 📋 SECCIÓN 5: MÉTRICAS Y MONITOREO (COMPLETADA)

### Qué medir y cómo:

```
📊 MÉTRICAS DE PRODUCTO:
   - Usuarios activos (DAU, MAU)
   - Tasa de conversión (visitantes → registrados)
   - Retention (vuelven después de 7 días?)
   - NPS (satisfacción)

📊 MÉTRICAS TÉCNICAS:
   - Response time (p50, p95, p99)
   - Error rate (< 1% es aceptable)
   - Uptime (> 99% es el objetivo)
   - Database query time

📊 MÉTRICAS DE NEGOCIO:
   - MRR (ingresos recurrentes mensuales)
   - Churn (cancelaciones)
   - CAC (costo de adquisición)
   - LTV (lifetime value)
```

### Herramientas de monitoreo:

```typescript
// Ejemplo: Monitoring middleware
import { monitor } from '@/lib/monitoring'

export async function GET() {
  return monitor(async () => {
    // Tu código aquí
    // Se mide automáticamente:
    // - Tiempo de respuesta
    // - Errores
    // - Rate limiting
  })
}
```

---

## 📋 SECCIÓN 6: PATRONES Y ANTI-PATRONES (COMPLETADA)

### ✅ PATRONES que deberías usar:

```
📦 Repository Pattern:
   - Separa lógica de negocio de acceso a datos
   - Facilita testing

🎯 Strategy Pattern:
   - Diferentes algoritmos intercambiables
   - Ejemplo: diferentes pagos (Stripe, PayPal)

🔧 Factory Pattern:
   - Crear objetos complejos
   - Ejemplo: crear doctores con diferentes especialidades

📡 Observer Pattern:
   - Reactividad
   - Ejemplo: actualizar UI cuando cambia data

🛃 Guard Clauses:
   - Validación temprana
   - Ejemplo: if (!user) return redirect('/login')
```

### ❌ ANTI-PATRONES que debes evitar:

```
🚫 God Object:
   - Una clase que hace TODO
   - Solución: Divide en responsabilidades

🚫 Magic Numbers:
   - Números sin explicación
   - Solución: Constants con nombres

🚫 Shotgun Surgery:
   - Cambiar algo requiere modificar 10 archivos
   - Solución: Cohesión baja

🚫 Primitive Obsession:
   - Usar strings/numbers para todo
   - Solución: Types específicos

🚫 Copy-Paste Programming:
   - Mismo código en varios lugares
   - Solución: Extract to function

🚫 Premature Optimization:
   - Optimizar antes de medir
   - Solución: Mide primero, optimiza lo necesario
```

---

## 🎯 EL FLUJO IDEAL CON DEEP RESEARCH INTEGRADO:

```
FASE 0: IDEA (5 min)
   → Tienes una idea básica

FASE 1: RESEARCH DE CONTEXTO (1 hora)
   → ¿El problema existe?
   → ¿Qué soluciones hay?
   → Usa: Swarm research + GitHub analysis

FASE 2: DEFINICIÓN (30 min)
   → Defines problema, flujo, MVP
   → SIN pensar aún en tecnología

FASE 3: RESEARCH TÉCNICO (1-2 horas)
   → ¿Qué stack debo usar?
   → Usa: Cross-model ensemble

FASE 4: CONSTRUCCIÓN (semanas)
   → Capa por capa
   → CUANDO TE ATASCAS → Research de solución

FASE 5: ANTES DE DECISIONES IMPORTANTES (1 hora)
   → Research de validación
   → Usa: Swarm de pros/contras
```

---

## 🔥 LA REGLA DE ORO DEL DEEP RESEARCH:

```
10% Planning + Research
80% Execution (building)
10% Review + Adjustment

NO:
50% Research
30% Execution
20% Limpieza de lo que no servía
```

---

*Fin de Sección 11 - Deep Research*

---

## 📊 ÍNDICE FINAL DE CONTENIDO:

| Sección | Contenido | Estado |
|---------|----------|--------|
| **1** | Fundamentos - Por qué tu enfoque no funciona | ✅ Completo |
| **2** | Proceso paso a paso - 9 pasos detallados | ✅ Completo |
| **3** | Arquitectura y Diseño - UI/UX y calidad visual | ✅ Completo |
| **4** | Herramientas y Automación - Scripts, CLIs, testing | ✅ **COMPLETADO** |
| **5** | Métricas y Monitoreo - KPIs, analytics, errores | ✅ **COMPLETADO** |
| **6** | Patrones y Anti-Patrones - Best practices | ✅ **COMPLETADO** |
| **7** | GUÍA DEFINITIVA INTEGRADA - Todo en un flujo | ✅ Completo |
| **8** | 10 Preguntas Adicionales - Respuestas completas | ✅ Completo |
| **9** | GUÍA PRÁCTICA - Cómo YO lo haría | ✅ Completo |
| **10** | IA MODERNA - Multi-agentes, Swarms, Ensemble | ✅ Completo |
| **11** | **DEEP RESEARCH - Cuándo y cómo usarlo** | ✅ **NUEVO** |

---

## 🎯 ESTADÍSTICAS FINALES:

- **~3600 líneas** de guía detallada
- **8 preguntas** respondidas completamente
- **10 preguntas adicionales** con respuestas detalladas
- **Guía práctica** día a día
- **Prompts listos** para usar con Claude Code
- **Estrategias de IA moderna** con ejemplos concretos
- **Deep Research** con 5 momentos precisos + swarm strategies
- **Secciones 4, 5, 6** completadas con contenido práctico
- **Roadblock de adopción** paso a paso

---

## 🏆 LOGRO: GUÍA 100% COMPLETADA

Todas las secciones planificadas tienen contenido. La guía ahora es un recurso completo para construir proyectos de código saludable desde cero hasta producción.

---

*Documento actualizado: 2025-02-10*

---

## 📄 ARCHIVO ADICIONAL 1: QUICKSTART.md

```
# QUICKSTART - COMANDOS EXACTOS PARA COPIAR/PEGAR
**Copia, pega, y empieza a construir YA**

---

## 🚀 DÍA 1: DEFINICIÓN + SETUP

### PASO 1: Crear archivos de planning (5 minutos)
```bash
# Crear archivos base
touch IDEA.md FLUJO.md BACKLOG.md PROGRESS.md
```

### PASO 2: Llenar IDEA.md (10 minutos)
```markdown
# MI IDEA

## El problema (1 frase)
Las personas no pueden encontrar doctores cuando están enfermos.

## Para quién
Pacientes en México que necesitan cita URGENTE.

## Qué quiero que hagan
Encuentren doctor → Vean perfil → Agenden → Tengan cita

## Por qué es URGENTE
Cuando estás enfermo, cada día cuenta.
```

### PASO 3: Iniciar Next.js (2 minutos)
```bash
npx create-next-app@latest mi-proyecto --typescript --tailwind --app
cd mi-proyecto
npm install @supabase/supabase-js
```

### PASO 4: Configurar Supabase (5 minutos)
```bash
# En .env.local:
NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_aqui
```

---

## 🔧 DÍA 2: PRIMERA FEATURE - BÚSQUEDA

### Crear tabla en Supabase:
```sql
-- En SQL Editor de Supabase:
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT,
  price_cents INTEGER,
  city TEXT,
  state TEXT,
  photo_url TEXT,
  rating_avg DECIMAL,
  rating_count INTEGER
);

INSERT INTO doctors (name, specialty, price_cents, city, state) VALUES
('Dra. María García', 'Cardiología', 50000, 'CDMX', 'CDMX'),
('Dr. Juan Pérez', 'Pediatría', 40000, 'Guadalajara', 'Jalisco'),
('Dra. Ana López', 'Medicina General', 35000, 'Monterrey', 'NL');
```

### Prompt para Claude:
```
"Crear página de búsqueda de doctores:
- Ruta: /app/doctors/page.tsx
- Fetch: SELECT * FROM doctors
- Filtro: por especialidad y ciudad
- Cards: con shadcn/ui Card, Badge
- Estilo: limpio, minimalista"
```

---

## 📝 DÍA 3-5: SIGUIENTE FEATURE

### Revisa PROGRESS.md:
```markdown
# PROGRESO

## Semana 1
☑ Búsqueda de doctores
☑ Perfil de doctor
☑ Botón agendar

## Semana 2
☐ Pagos con Stripe
☐ Videollamada

## Bloqueadores
- Esperando definir flujo de pagos
```

---

## 🧹 LIMPIEZA (Cada 3 días)

### Comandos útiles:
```bash
# Ver tipos any
grep -r ": any" src/ | grep -v node_modules

# Ver console.log
grep -r "console.log" src/ | wc -l

# Ver archivos grandes
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n | tail -10
```

---

## 🚀 DEPLOY

### A GitHub:
```bash
git init
git add .
git commit -m "MVP initial"
gh repo create mi-proyecto --public --source=.
git push -u origin main
```

### A Vercel:
```bash
# En vercel.com:
# 1. Import from GitHub
# 2. Connect
# 3. Deploy
```

---

## 📞 CUANDO ESTÉS ATASCADO:

### Usar este prompt:
```
"Estoy atascado con [PROBLEMA].
Contexto: [Qué estoy haciendo]
Intenté: [Qué ya probé]

Investiga y dame:
1. ¿Cómo lo resolvieron otros?
2. ¿Qué debo intentar?
3. Código de ejemplo si existe."
```

---

## 🎯 CHECKLIST RÁPIDO:

```
☐ Problema definido en 1 frase
☐ Flujo dibujado
☐ MVP listado
☐ Proyecto iniciado
☐ Primera feature funciona
☐ Testing manual hecho 5 veces
☐ Limpieza básica hecha
☐ Deploy listo

→ SIGUIENTE FEATURE
```

---

*Fin de Quickstart.md*
```

---

## 📄 ARCHIVO ADICIONAL 2: CHEATSHEET.md

```
# CHEATSHEET - PROMPTS Y COMANDOS LISTOS
**Copia, pega, úsalo ya**

---

## 🤖 PROMPTS PARA CLAUDE CODE

### Para PLANNING:
```
"Eres el ARCHITECTO. Mi idea es: [TU IDEA]

Tu trabajo:
1. NO escribir código
2. Planificar la arquitectura
3. Definir qué es MÍNIMO viable
4. Entregar: estructura de archivos, datos, flujos

Empieza preguntándome lo que necesites saber."
```

### Para BUILDING:
```
"Eres el BUILDER. Recibe este plan:
[PLAN DEL ARCHITECT]

Tu trabajo:
1. Escribir código según el plan
2. SOLO lo que el plan dice
3. NO agregar cosas extra
4. Comentar código complejo

Empieza con la primera feature del plan."
```

### Para REVIEWING:
```
"Eres el REVIEWER. Este código:
[PEGAR CÓDIGO AQUÍ]

Tu trabajo:
1. Buscar bugs
2. Buscar code smells
3. Buscar problemas de seguridad
4. Buscar problemas de performance
5. Sugerir refactorizaciones específicas

Entrega: Lista de problemas con soluciones sugeridas."
```

---

## 🔧 COMANDOS ÚTILES

### Next.js:
```bash
# Crear proyecto
npx create-next-app@latest mi-proyecto --typescript --tailwind --app
# Dev server
npm run dev
# Build
npm run build
```

### Git:
```bash
# Commit con mensaje
git add .
git commit -m "feat: description"
# Ver log
git log --oneline
```

---

## 🎯 PROMPT MAESTRO (TODO EN UNO)

```
"Quiero construir [PROYECTO] siguiendo esta metodología:

FASE 1 - DEFINICIÓN:
- Define el problema en 1 frase
- Dibuja el flujo en texto
- Lista el MÍNIMO viable

FASE 2 - SETUP:
- Next.js + TypeScript + Tailwind
- Supabase para database
- Autenticación lista

Comienza siendo ARCHITECT y pregúntame lo necesario."
```

---

*Fin de Cheatsheet.md*
```

---

## 📄 ARCHIVO ADICIONAL 3: README.md

```
# DOCTOR.MX - GUÍA DE CONSTRUCCIÓN DE CODEBASE SALUDABLE

**Guía completa para construir código saludable desde cero hasta producción**

---

## 🚀 START HERE (Si tienes prisa)

**Tiempo de lectura: 2 minutos**

Esta guía te ayudará a construir código saludable sin el ciclo infinito de:
- Escribir código → Limpiar → Refactorizar → Repetir

**La clave:** Construye UNA cosa a la vez, pruébala, estabilízala, luego agrega la siguiente.

---

## 🎯 Los 7 Pasos Esenciales

1. **Define el problema** (15 min) - Una frase clara
2. **Dibuja el flujo** (15 min) - Usuario → [Pasos] → Fin
3. **Define el MÍNIMO** (10 min) - SOLO lo crítico
4. **Inicia el proyecto** (10 min) - Next.js + Supabase
5. **Construye UNA cosa** (1-3 días) - Prueba antes de continuar
6. **Limpia cada 3 días** (30 min) - Código limpio siempre
7. **Repite para siguiente feature** - Solo cuando anterior está estable

---

## 💡 La Única Regla Que Necesitas

> **"Construye LO MÍNIMO que funciona, pruébalo, estabilízalo, y solo AGREGA lo siguiente."**

---

## 📁 Cómo Usar Esta Guía

```
PRIMERA VEZ:
1. Lee este README (2 min)
2. Lee Sección 0 (Start Here) (5 min)
3. Lee Sección 9 (Guía Práctica) (15 min)
4. ¡Empieza a construir!
```

---

## 🛠️ Tech Stack Recomendado

```
Frontend: Next.js + TypeScript + Tailwind
Database: Supabase (PostgreSQL)
Auth: Supabase Auth
Payments: Stripe
Deploy: Vercel
Testing: Vitest + Playwright
```

---

## 📊 Progreso de la Guía

```
✅ Sección 0: Start Here
✅ Sección 1-11: Todo el contenido
✅ Quickstart.md
✅ Cheatsheet.md
✅ README.md

🎯 GUÍA 100% COMPLETA
```

---

*Última actualización: 2025-02-10*
*Versión: 2.0 - Guía Completa*
```

---

## 📊 ÍNDICE FINAL ACTUALIZADO:

| Archivo | Contenido | Líneas |
|---------|----------|--------|
| **CODEBASE_SALUDABLE_GUIA.md** | Guía completa | ~4500 |
| └─ Sección 0 | Start Here | ✅ Nuevo |
| └─ Secciones 1-11 | Todo el contenido | ✅ Completo |
| └─ Quickstart.md | Comandos exactos | ✅ Nuevo |
| └─ Cheatsheet.md | Prompts listos | ✅ Nuevo |
| └─ README.md | Resumen 1 página | ✅ Nuevo |

---

**Versión final actualizada: 2025-02-10**
**Total: ~4500 líneas de guía completa**
