# Research: Reserva de Turno — Vista del Cliente

## Decisiones técnicas

### Renderizado de la página principal

**Decisión**: Server Component con fetch de datos en el servidor.
**Rationale**: La lista de profesionales y servicios es estática en el momento de la carga. Usando RSC se reduce el bundle del cliente y los datos llegan pre-cargados (Principio IX).
**Alternativas consideradas**: Client Component con useEffect → descartado por violar Principio IX y generar flash de contenido vacío.

### Selección de profesional + servicio

**Decisión**: Client Component (`"use client"`) encapsulado en un componente `BookingSelector` que maneja el estado de selección local (profesional elegido, servicio elegido).
**Rationale**: La selección es interactividad pura del usuario, requiere `useState`. El componente padre (RSC) pasa los datos pre-cargados como props.
**Alternativas consideradas**: Server Actions para cada selección → innecesario, la selección es estado local.

### Confirmación de turno

**Decisión**: `POST /api/bookings` desde el Client Component. La respuesta incluye el turno creado.
**Rationale**: El POST debe ir al servidor para persistir y verificar disponibilidad. La API Route actúa como única puerta de acceso (Principio IV + IX).

### Manejo de UUID

**Decisión**: Los IDs ya usan formato `prof-N`, `svc-N`, `book-N`. Se migrará a UUID v4 usando `crypto.randomUUID()` en el servidor al crear bookings (Principio VII).
**Rationale**: Los IDs actuales en los JSONs existentes se mantienen por compatibilidad. Los nuevos bookings generarán UUID v4.

### Expansión del modelo de servicios

**Decisión**: Agregar 3 servicios nuevos al JSON: Diseño de barba, Corte de ceja, Alisado/keratina. Agregar campo `targetAudience` a profesionales.
**Rationale**: La constitución (v1.6.0) documenta servicios adicionales y atención diferenciada por tipo de cliente. Los datos deben reflejar el dominio real.

### Framework de tests

**Decisión**: Vitest para unit/integration, Playwright para e2e (Estándares de Testing, constitución v1.2.0).
**Rationale**: Vitest tiene integración nativa con el ecosistema de Next.js/Vite.

### Diseño visual

**Decisión**: Minimalista con shadcn. Cards para profesionales, badges para servicios, botón primario para confirmar. Sin decoraciones innecesarias.
**Rationale**: La constitución define shadcn como estándar UI (Principio II). El dominio (barbería) se beneficia de una UI limpia y directa.
