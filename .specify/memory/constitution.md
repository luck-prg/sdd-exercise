<!--
SYNC IMPACT REPORT
==================
Version change: 1.6.0 → 1.7.0
Principios modificados:
  - Principio II: "Componentes UI con shadcn" — se agrega mandato de consultar la skill `shadcn` antes de agregar componentes
Principios agregados:
  - Principio XII: Lint y Calidad de Código (nuevo)
  - Principio XIII: Diseño UX con Skills Especializadas (nuevo)
  - Principio XIV: Buenas Prácticas de React (nuevo)
Secciones eliminadas: ninguna
Templates:
  ✅ .specify/templates/plan-template.md — actualizado a 14 principios
  ⚠  .specify/templates/spec-template.md — sin cambios requeridos
  ⚠  .specify/templates/tasks-template.md — sin cambios requeridos
TODOs diferidos: ninguno
-->

# Barbería Turnos — Frontend Constitution

## Dominio del Sistema

### Objetivo

El sistema DEBE permitir la gestión integral de turnos de una barbería/peluquería.
El objetivo final es que los clientes puedan reservar turnos con el profesional de
su elección, y que el administrador pueda gestionar la agenda completa del negocio.

### Roles de Usuario

**Cliente**

- Visualiza los profesionales disponibles y sus servicios.
- Consulta los horarios libres de un profesional para una fecha dada.
- Se asigna un turno disponible para asistir a la barbería.
- No accede a información de otros clientes ni a la agenda global.

**Administrador**

- Visualiza la agenda completa: todos los turnos ocupados y libres.
- Ve qué profesional tiene asignado cada turno y qué cliente lo reservó.
- Gestiona la disponibilidad de los profesionales (horarios, días libres).
- Tiene acceso total al estado del negocio.

### Entidades del Dominio

**Profesional (peluquero/barbero/estilista)**

Cada profesional define su propio perfil de servicios:

- **Público atendido**: hombres, mujeres, niños (puede ser uno o varios).
- **Servicios ofrecidos** (selección propia de cada profesional):
  - Corte de cabello
  - Corte + barba
  - Diseño de barba
  - Corte de ceja
  - Coloración / tinte de cabello
  - Alisado / keratina
- **Horario propio**: cada profesional define sus días y horas de trabajo
  de forma independiente.

**Turno (Booking)**

Unidad mínima de reserva. Tiene: profesional asignado, cliente, servicio,
fecha, hora de inicio y fin, y estado (`confirmed` | `cancelled`).

**Slot**

Intervalo de tiempo calculado a partir del horario del profesional y la
duración del servicio, descontando los turnos ya confirmados. No se persiste:
se deriva en runtime.

### Flujos Principales

```
Cliente:
  Ver profesionales → Elegir profesional → Ver slots disponibles
    → Confirmar turno → Ver confirmación

Administrador:
  Ver agenda del día → Ver detalle de turno → Gestionar disponibilidad
```

### Restricciones de Dominio

- Un profesional NO PUEDE tener dos turnos confirmados que se superpongan.
- Un turno NO PUEDE reservarse en un horario fuera del `workingHours` del
  profesional.
- Un turno NO PUEDE reservarse en el pasado.
- Un cliente NO PUEDE ver ni modificar turnos de otros clientes.

## Core Principles

### I. Test-First (NON-NEGOTIABLE)

El desarrollo DEBE seguir el ciclo TDD estrictamente: los tests se escriben primero,
se verifica que fallen (red), luego se implementa (green), y finalmente se refactoriza.

- Los tests unitarios y de integración DEBEN escribirse antes de cualquier implementación.
- La estructura de tests DEBE seguir esta organización:
  ```
  tests/
    unit/
      app/          ← tests de páginas y vistas (app router)
      components/   ← tests de componentes UI
      services/     ← tests de lógica de servicios y helpers
      lib/          ← tests de utilidades y funciones puras
    e2e/
      app/          ← flujos end-to-end por vista
  ```
- Ningún código de producción DEBE mergearse sin cobertura de tests correspondiente.
- Los tests de integración DEBEN cubrir contratos entre componentes y entre
  frontend y API.

**Rationale**: Detectar regresiones temprano y garantizar que cada pieza del sistema
es independientemente verificable antes de integrarse.

### II. Componentes UI con shadcn

Todos los componentes visuales DEBEN construirse sobre primitivos de **shadcn/ui**.

- No se DEBE crear un componente UI desde cero si shadcn provee uno equivalente.
- Los tokens de diseño (colores, radios, tipografía) DEBEN venir del sistema de
  variables CSS de shadcn definido en `app/globals.css`.
- Los componentes propios DEBEN extender los de shadcn, no reemplazarlos.
- Antes de agregar cualquier componente shadcn nuevo al proyecto, se DEBE consultar
  la skill `shadcn` para obtener la instalación y uso correctos del componente
  en la versión activa del proyecto.

**Rationale**: Consistencia visual, accesibilidad nativa y menor superficie de
mantenimiento. Consultar la skill evita incompatibilidades por diferencias entre
versiones de shadcn/ui.

### III. Componentización Modular y Atómica

Cada componente DEBE tener una única responsabilidad bien definida.

- Los componentes DEBEN ser atómicos: representar una unidad funcional mínima.
- La composición DEBE ser jerárquica: átomos → moléculas → organismos.
- Ningún componente DEBE contener lógica de negocio directamente; esta DEBE vivir
  en hooks o servicios dedicados.
- Los componentes DEBEN ser reutilizables y NO acoplar su lógica a un contexto
  específico de la aplicación.

**Rationale**: Facilitar el mantenimiento, el testing aislado y la reutilización
entre vistas.

### IV. Consumo de APIs con Express

El consumo de APIs DEBE realizarse a través de una capa de servicio estructurada
con patrones Express.

- Toda llamada a una API DEBE estar encapsulada en un módulo de servicio; no se
  DEBE hacer fetch directo desde componentes.
- Los servicios DEBEN manejar errores de red y retornar tipos seguros definidos en
  `lib/types.ts`.
- Las API Routes de Next.js (`app/api/`) actúan como capa intermedia y DEBEN ser
  el único punto de acceso a los datos desde el frontend.

**Rationale**: Desacoplar el transporte HTTP de la lógica de presentación y
centralizar el manejo de errores de red.

### V. Performance y Resiliencia

El sistema DEBE mantenerse responsivo y funcional ante fallos parciales.

- Toda request a una API NO DEBE superar **1000ms** (p95). Las requests que superen
  este umbral DEBEN activar un timeout con fallback visible al usuario.
- El sistema DEBE ser resiliente: si una API falla, la UI DEBE mostrar un estado
  de error manejado; nunca romperse silenciosamente.
- Cada componente con datos remotos DEBE manejar los estados: `loading`, `error`
  y `empty` además del estado de éxito.
- Se DEBEN implementar reintentos con backoff exponencial para requests críticas.

**Rationale**: La experiencia del usuario no puede degradarse por latencia o fallos
de servicios externos fuera del control del frontend.

### VI. Rutas Claras y Bien Definidas

La estructura de rutas DEBE ser predecible, consistente y autodocumentada.

- Las rutas DEBEN seguir la convención del App Router de Next.js:
  ```
  /                              ← listado principal
  /[resource]/[id]               ← detalle de un recurso
  /[resource]/[id]/[action]      ← acción sobre un recurso
  /api/[resource]                ← endpoint REST (GET colección / POST)
  /api/[resource]/[id]           ← endpoint REST (GET individual)
  ```
- Los segmentos de ruta DEBEN usar kebab-case.
- Los parámetros dinámicos DEBEN documentarse con su tipo esperado en el contrato
  de la API.

**Rationale**: Rutas predecibles reducen la carga cognitiva y facilitan el testing
end-to-end.

### VII. Identidad con UUID

Todos los identificadores de entidades DEBEN ser de tipo **UUID v4**.

- Ningún ID DEBE ser un entero secuencial autoincremental expuesto en URLs o APIs.
- Los IDs DEBEN generarse en el servidor, nunca en el cliente.
- Las referencias cruzadas entre entidades DEBEN usar el UUID completo.

**Rationale**: Los IDs secuenciales exponen el volumen de datos y son predecibles,
lo que representa un vector de enumeración. Los UUID eliminan esa vulnerabilidad.

### VIII. Validación de Datos Externos y Almacenamiento Seguro (Zero Trust)

El sistema DEBE desconfiar de todo dato que provenga de fuera del sistema y DEBE
proteger la información que persiste en el cliente.

**Validación de entradas:**

- Todo input del usuario DEBE ser validado antes de procesarse o enviarse a una API.
- Todo dato recibido de una API DEBE validarse contra el tipo esperado antes de
  usarse en la UI.
- Las API Routes DEBEN validar el body de cada request (campos requeridos, tipos,
  formato) y retornar `400` con mensaje descriptivo ante datos inválidos.
- No se DEBE confiar en datos provenientes de `localStorage`, `searchParams` o
  cookies sin validación previa.

**Almacenamiento en cliente (cookies y localStorage) — NON-NEGOTIABLE:**

- NUNCA se DEBEN almacenar en `localStorage` ni en cookies accesibles por JavaScript:
  tokens de autenticación, credenciales, IDs de sesión, UUIDs de entidades sensibles
  ni ningún dato que pueda usarse para acceder o modificar recursos del sistema.
- Si se requiere persistir información de sesión, DEBE usarse una cookie con los
  atributos `HttpOnly` y `Secure` gestionada exclusivamente por el servidor; el
  cliente JavaScript NUNCA DEBE poder leerla.
- Solo se PUEDE almacenar en `localStorage` información de presentación no sensible:
  preferencias de UI (tema, idioma), estado de filtros, configuración de visualización.
- Todo dato leído de `localStorage` o cookies DEBE tratarse como no confiable y
  validarse antes de usarse.
- Si un agente malicioso obtiene el contenido de `localStorage` o las cookies
  accesibles por JS, NO DEBE poder usarlos para acceder a datos de otros usuarios
  ni escalar privilegios.

**Rationale**: `localStorage` es accesible por cualquier script en la página y
vulnerable a ataques XSS. Almacenar tokens o datos sensibles allí equivale a
dejarlos en texto plano. La regla es simple: si comprometerlo tiene consecuencias
de seguridad, no va en el cliente.

### IX. Arquitectura de Renderizado Next.js

El proyecto DEBE usar **Next.js 16.2.4** con App Router y seguir sus convenciones
de renderizado para optimizar performance y seguridad.

- Por defecto, todos los componentes DEBEN ser **Server Components** (RSC). Solo se
  DEBE agregar `"use client"` cuando el componente requiere: interactividad del
  usuario, hooks de React (`useState`, `useEffect`, etc.) o APIs del browser.
- Los datos DEBEN fetchearse en el servidor (Server Components o Route Handlers).
  Ningún componente cliente DEBE hacer fetch directo a servicios externos o a la
  base de datos.
- Las **API Routes** (`app/api/`) DEBEN ser la única puerta de acceso del cliente a
  los datos. El cliente NUNCA DEBE conocer el origen real de los datos (archivo,
  base de datos, servicio externo).
- Los componentes pesados o que no son necesarios en la carga inicial DEBEN usar
  `next/dynamic` con `{ ssr: false }` cuando corresponda para diferir su carga.
- Se DEBEN usar **Suspense boundaries** para manejar estados de carga de forma
  declarativa y habilitar streaming.
- Ningún dato sensible (credenciales, lógica de acceso, rutas internas de datos)
  DEBE incluirse en el bundle del cliente.

**Rationale**: Next.js 16 con App Router permite separar estrictamente qué se
ejecuta en el servidor y qué en el cliente. Usar RSC por defecto reduce el bundle
del cliente, mejora el tiempo de carga inicial y protege la lógica de negocio.
Las API Routes garantizan que el cliente no sepa ni necesite saber cómo se obtienen
los datos, lo que permite cambiar la fuente de datos sin tocar el frontend.

### X. Diseño Responsive

Toda vista del proyecto DEBE funcionar correctamente en los tres breakpoints
estándar actuales: **móvil, tablet y desktop**.

- Los breakpoints de referencia son los de **Tailwind CSS v4** integrado en el
  proyecto:
  ```
  sm:  640px  ← móvil landscape / tablet pequeña
  md:  768px  ← tablet portrait
  lg:  1024px ← desktop
  xl:  1280px ← desktop grande
  ```
- El diseño DEBE adoptar enfoque **mobile-first**: los estilos base apuntan al
  móvil y se expanden con prefijos `md:`, `lg:`, etc.
- Ninguna vista DEBE presentar scroll horizontal, elementos cortados o
  superposiciones no intencionales en ninguno de los breakpoints de referencia.
- Los componentes táctiles (botones, cards, slots de calendario) DEBEN tener
  un área de toque mínima de **44×44px** en móvil.
- Las imágenes y recursos visuales DEBEN usar dimensiones relativas o
  `next/image` con `layout responsive` para adaptarse al viewport.
- Cada vista nueva DEBE verificarse manualmente (o con test e2e) en al menos
  tres anchos: 375px (iPhone SE), 768px (iPad), 1280px (desktop estándar).

**Rationale**: El usuario de una barbería accede mayoritariamente desde el
teléfono. Un diseño que no funcione en móvil implica pérdida directa de
conversiones. El soporte multi-dispositivo no es opcional.

### XI. Middleware-First y Manejo de Errores de Ruta

Los datos necesarios para renderizar una vista DEBEN estar disponibles antes de
que el componente se renderice. La vista NUNCA DEBE iniciar en un estado vacío
esperando que los datos lleguen luego del render inicial.

**Carga de datos previa al render:**

- Los datos de cada página DEBEN obtenerse en el servidor antes de renderizar:
  en el Server Component de la ruta (`page.tsx` async) o en el `layout.tsx`
  correspondiente cuando los datos son compartidos por múltiples rutas.
- NUNCA se DEBE renderizar una vista y luego iniciar la carga de sus datos
  principales en el cliente (sin skeleton de carga intencional).
- El flujo DEBE ser: **middleware → fetch de datos → render**. Si algún paso
  falla, el render no ocurre.

**Middleware (`middleware.ts`):**

- El archivo `middleware.ts` en la raíz DEBE usarse para validaciones de ruta
  previas (acceso, autenticación, redirecciones) que aplican globalmente.
- El middleware DEBE ejecutarse antes de cualquier Server Component o Route
  Handler de la ruta afectada.
- Si el middleware detecta una condición de error o acceso denegado, DEBE
  redirigir o responder antes de que el render se inicie.

**Manejo de errores de ruta (NON-NEGOTIABLE):**

- Si los datos requeridos para una página no existen o no se pueden obtener,
  DEBE llamarse `notFound()` de `next/navigation` → Next.js renderiza el
  archivo `not-found.tsx` correspondiente (HTTP 404).
- Si ocurre un error inesperado durante el fetch o procesamiento de datos,
  DEBE lanzarse un `Error` que sea capturado por el `error.tsx` más cercano
  en la jerarquía → Next.js renderiza la pantalla de error (HTTP 500).
- Cada segmento de ruta con datos críticos DEBE tener su propio `error.tsx`
  y `not-found.tsx` para mostrar mensajes de error contextuales.
- NUNCA se DEBE renderizar una vista con datos parciales o en estado
  indefinido como resultado de un fallo no manejado.

**Rationale**: Renderizar primero y cargar datos después genera flashes de
contenido vacío, estados inconsistentes y peor UX. La arquitectura
middleware-first garantiza que lo que el usuario ve es siempre un estado
válido y completo, o una pantalla de error informativa.

### XII. Lint y Calidad de Código (NON-NEGOTIABLE)

El código DEBE pasar sin errores ni advertencias todas las reglas de lint
configuradas en el proyecto antes de cualquier commit o merge.

- NUNCA se DEBE deshabilitar una regla de ESLint con `// eslint-disable` a menos
  que exista una justificación técnica documentada en el mismo comentario.
- Las reglas de lint DEBEN ejecutarse como parte del pipeline de CI; un build con
  errores de lint DEBE fallar.
- El código DEBE formatearse con Prettier antes de commitearse; la configuración
  del proyecto es la fuente de verdad.
- No se DEBEN ignorar ni suprimir advertencias de TypeScript con `@ts-ignore` o
  `as any` sin justificación explícita documentada.
- Los tipos DEBEN ser estrictos: `strict: true` en `tsconfig.json` DEBE mantenerse
  habilitado en todo momento.

**Rationale**: El lint es la primera línea de defensa contra bugs silenciosos,
inconsistencias de estilo y deuda técnica acumulada. Mantenerlo en cero permite
que las advertencias nuevas sean inmediatamente visibles y accionables.

### XIII. Diseño UX con Skills Especializadas

Toda decisión de diseño de experiencia de usuario DEBE apoyarse en las skills
especializadas disponibles en el proyecto.

- Antes de diseñar o revisar la UX de cualquier vista o flujo, se DEBE consultar
  la skill **`ui-ux-pro-max`** para obtener guía sobre jerarquía visual, flujo de
  usuario, microcopy y accesibilidad.
- Las decisiones de diseño web (tipografía, espaciado, grillas, paleta de color,
  componentes visuales) DEBEN validarse contra la skill **`web-design-guidelines`**
  antes de implementarse.
- Ninguna vista nueva DEBE implementarse sin haber pasado primero por una revisión
  de UX usando ambas skills.
- Las observaciones de las skills DEBEN documentarse en el plan de la feature antes
  de pasar a la fase de implementación.

**Rationale**: Las skills especializadas concentran patrones probados de UX y
diseño. Consultarlas antes de implementar evita retrabajo costoso y garantiza
que cada vista cumpla estándares de usabilidad desde el primer commit.

### XIV. Buenas Prácticas de React

Todo código React del proyecto DEBE seguir las mejores prácticas definidas para
el ecosistema Next.js/React actual.

- Antes de implementar cualquier patrón React no trivial (custom hooks, context,
  optimizaciones de render, manejo de estado), se DEBE consultar la skill
  **`vercel-react-best-practices`** para validar el enfoque.
- Los componentes DEBEN evitar renders innecesarios: usar `memo`, `useMemo` y
  `useCallback` solo cuando el profiling lo justifique, no de forma preventiva.
- El estado DEBEN colocarse lo más cerca posible de donde se usa (colocación de
  estado); evitar elevar estado innecesariamente.
- Los efectos secundarios (`useEffect`) DEBEN tener dependencias correctas y
  limpieza (`cleanup`) cuando corresponda.
- No se DEBEN usar patrones deprecados o anti-patterns documentados por Vercel/React
  team (class components, `componentDidMount` sobre `useEffect`, etc.).

**Rationale**: El ecosistema React evoluciona rápido y los anti-patterns de versiones
anteriores aún circulan. La skill `vercel-react-best-practices` concentra las
recomendaciones actuales del equipo de Vercel, quienes mantienen Next.js y están
alineados con el roadmap de React.

## Estándares de Testing

Reglas operativas que hacen ejecutable el Principio I.

### Tooling

- El runner de tests para unit e integración DEBE ser **Vitest**.
- Los tests e2e DEBEN usar **Playwright**.
- Cada archivo de test DEBE vivir en `tests/` siguiendo el path de su tipo
  (ver Principio I), NO junto al archivo de producción.
- Los archivos de test DEBEN seguir el patrón `[nombre-del-módulo].test.ts`.

### Cobertura (NON-NEGOTIABLE)

- La cobertura mínima del proyecto DEBE ser **80%** en líneas y ramas para todos
  los módulos (no solo los críticos).
- NUNCA se DEBE escribir un test cuyo único propósito sea inflar el porcentaje
  de coverage. Un test que no valida comportamiento real DEBE ser eliminado.
- Cada test DEBE validar un comportamiento observable del sistema, no la
  implementación interna.

### Integridad del flujo

- Los tests DEBEN validar el flujo completo del escenario que cubren: entrada →
  procesamiento → salida/efecto observable. No se DEBEN testear pasos aislados
  cuando el valor real está en la cadena completa.
- Si durante la implementación un test necesita ser modificado para que pase,
  se DEBE pausar y validar si el cambio es correcto **antes de modificarlo**:
  - Si el test era incorrecto (mal escrito, asunción errónea) → se corrige el test.
  - Si la implementación rompió un contrato existente → se corrige la implementación.
  - Nunca se DEBE modificar un test solo para que la build pase sin esta validación.
- Ante cualquier duda sobre si un test debe cambiar, se DEBE consultar con el
  equipo o el responsable de la especificación antes de proceder.

## Gobernanza

Esta constitución DEBE ser respetada en cada PR, revisión de código y decisión
de arquitectura del proyecto.

- Cualquier violación DEBE ser documentada con justificación antes de mergearse.
- Las enmiendas DEBEN incrementar la versión según semver:
  - **MAJOR**: eliminación o redefinición de un principio existente.
  - **MINOR**: nuevo principio o sección agregada.
  - **PATCH**: aclaraciones, correcciones de redacción.
- El `Constitution Check` en cada plan de implementación DEBE verificar los
  14 principios antes de comenzar la fase de desarrollo.
- Las enmiendas DEBEN commitearse con:
  `docs: amend constitution to vX.Y.Z (<descripción del cambio>)`

**Version**: 1.7.0 | **Ratified**: 2026-04-21 | **Last Amended**: 2026-04-21
