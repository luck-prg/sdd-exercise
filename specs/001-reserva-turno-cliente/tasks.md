---
description: "Task list — Reserva de Turno — Vista del Cliente"
---

# Tasks: Reserva de Turno — Vista del Cliente

**Input**: Design documents from `specs/001-reserva-turno-cliente/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/api-contracts.md ✅

**TDD obligatorio** (Constitución I): cada test DEBE escribirse y FALLAR antes de implementar el código correspondiente.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias incompletas)
- **[US1]**: User Story 1 — Reservar turno (flujo happy path)
- **[US2]**: User Story 2 — Sin disponibilidad

---

## Phase 1: Setup — Infraestructura de testing

**Purpose**: Configurar Vitest y Playwright antes de escribir cualquier test.

- [x] T001 Instalar y configurar Vitest con soporte React + jsdom en `vitest.config.ts`
- [x] T002 [P] Instalar y configurar Playwright en `playwright.config.ts` apuntando a `http://localhost:3000`
- [x] T003 [P] Crear estructura de carpetas de tests: `tests/unit/lib/`, `tests/unit/components/`, `tests/unit/app/`, `tests/e2e/app/`
- [x] T004 Agregar scripts en `package.json`: `"test": "vitest run"`, `"test:e2e": "playwright test"`, `"test:watch": "vitest"`

---

## Phase 2: Foundational — Datos, tipos y API

**Purpose**: Actualizar el modelo de datos y la capa de tipos para reflejar el dominio completo. Bloqueante para todas las user stories.

**⚠️ CRÍTICO**: Ninguna tarea de user story puede comenzar hasta completar esta fase.

- [x] T005 Actualizar `data/services.json`: agregar `svc-4` (Diseño de barba, 30min, $600), `svc-5` (Corte de ceja, 15min, $300), `svc-6` (Alisado/keratina, 90min, $3500)
- [x] T006 [P] Actualizar `data/professionals.json`: agregar campo `targetAudience` a cada profesional y expandir `serviceIds` según `data-model.md` (Carlos: svc-1/2/4/5, Valentina: svc-1/3/5/6, Martín: svc-1/2/4)
- [x] T007 [P] Actualizar `lib/types.ts`: agregar `TargetAudience = "men" | "women" | "children"` y campo `targetAudience: TargetAudience[]` en tipo `Professional`
- [x] T008 Actualizar `app/api/bookings/route.ts`: reemplazar `id: \`book-${Date.now()}\`` por `id: crypto.randomUUID()` (Principio VII)
- [x] T009 Crear `lib/api.ts`: funciones `getProfessionals()`, `getServices()`, `getBookings(professionalId, date?)`, `createBooking(input)` que encapsulan fetch a `/api/*` con timeout de 3000ms (Principio IV + V)
- [x] T010 [P] Crear `app/not-found.tsx`: pantalla 404 global con mensaje "Página no encontrada" y link para volver al inicio (shadcn Button)
- [x] T011 [P] Crear `app/error.tsx`: pantalla de error 500 global con mensaje descriptivo y botón de reintentar usando `reset` prop de Next.js

**Checkpoint**: datos actualizados, tipos consistentes, API encapsulada → user stories pueden comenzar.

---

## Phase 3: User Story 1 — Reservar turno con profesional y servicio (P1) 🎯 MVP

**Goal**: El cliente ve profesionales, elige uno y un servicio, confirma y recibe turno asignado.

**Independent Test**: Abrir `http://localhost:3000`, seleccionar cualquier profesional, cualquier servicio, confirmar → ver fecha y hora asignadas.

### Tests para User Story 1 ⚠️ Escribir PRIMERO — verificar que FALLAN

- [x] T012 [P] [US1] Crear `tests/unit/lib/slots.test.ts`: tests para `getAvailableSlots` (sin bookings, con slots ocupados, día libre null) y `getNextAvailableSlot` (slot en día siguiente)
- [x] T013 [P] [US1] Crear `tests/unit/components/ServiceBadge.test.tsx`: renderiza nombre del servicio; aplica clase/estilo de seleccionado cuando `selected=true`; aplica clase de no-seleccionado cuando `selected=false`
- [x] T014 [P] [US1] Crear `tests/unit/components/ProfessionalCard.test.tsx`: renderiza nombre, rol y bio del profesional; renderiza un ServiceBadge por cada servicio del profesional; emite callback `onServiceSelect` al hacer click en un servicio
- [x] T015 [P] [US1] Crear `tests/unit/app/page.test.tsx`: renderiza un ProfessionalCard por cada profesional; botón "Continuar" deshabilitado si no hay servicio seleccionado; botón habilitado tras seleccionar profesional y servicio
- [x] T016 [P] [US1] Crear `tests/unit/components/BookingConfirmation.test.tsx`: muestra nombre del profesional, nombre del servicio, fecha formateada (día/mes) y hora de inicio del turno asignado
- [x] T017 [P] [US1] Crear `tests/unit/app/booking-page.test.tsx`: renderiza BookingConfirmation cuando hay slot disponible; muestra mensaje de "sin disponibilidad" cuando `getNextAvailableSlot` retorna null; llama a `notFound()` cuando el profesional no existe

### Implementación User Story 1

- [x] T018 [P] [US1] Crear `components/ServiceBadge.tsx`: Badge shadcn clickable que muestra nombre del servicio; prop `selected: boolean` cambia variante visual; prop `onSelect: () => void`
- [x] T019 [US1] Crear `components/ProfessionalCard.tsx`: Card shadcn con nombre (CardTitle), rol (CardDescription), bio (CardContent) y grid de ServiceBadge por cada serviceId; prop `selectedServiceId`; callback `onServiceSelect(serviceId)`
- [x] T020 [US1] Crear `components/BookingSelector.tsx` (`"use client"`): orquesta estado `selectedProfessionalId` y `selectedServiceId`; renderiza lista de ProfessionalCard; botón "Continuar" shadcn habilitado solo cuando ambos están seleccionados; al click navega a `/booking/[id]?serviceId=[id]` via `useRouter`
- [x] T021 [US1] Actualizar `app/page.tsx`: Server Component que hace `await getProfessionals()` y `await getServices()` del servidor; pasa datos como props a `BookingSelector`; sin `"use client"`
- [x] T022 [US1] Crear `app/booking/[id]/page.tsx`: Server Component; valida `params.id` y `searchParams.serviceId`; llama `notFound()` si profesional no existe; llama `getNextAvailableSlot()` con datos pre-cargados; pasa slot (o null) a `BookingClient`
- [x] T023 [US1] Crear `components/BookingConfirmation.tsx`: presentación del turno confirmado (Card shadcn); muestra profesional, servicio, fecha formateada en español, hora; botón secundario "Volver a inicio"
- [x] T024 [US1] Crear `components/BookingClient.tsx` (`"use client"`): recibe slot pre-calculado; si null muestra estado "sin disponibilidad" con botón volver; si hay slot muestra BookingConfirmation y botón "Confirmar turno"; al confirmar: `POST /api/bookings` via `createBooking()`; maneja estados `loading`, `error`, `success`
- [x] T025 [US1] Crear `app/booking/[id]/error.tsx`: error específico de la página de confirmación con mensaje "No pudimos procesar tu reserva" y botón para reintentar (`reset`) o volver al inicio

**Checkpoint**: User Story 1 completamente funcional e independientemente testeable.

---

## Phase 4: User Story 2 — Sin disponibilidad (P2)

**Goal**: El sistema informa claramente cuando no hay turnos disponibles y permite al cliente elegir otro profesional.

**Independent Test**: Bloquear todos los slots de un profesional → confirmar con él → ver mensaje de no disponibilidad con opción de volver.

### Tests para User Story 2 ⚠️ Escribir PRIMERO — verificar que FALLAN

- [x] T026 [P] [US2] Agregar en `tests/unit/app/booking-page.test.tsx`: cuando `getNextAvailableSlot` retorna null, el componente muestra texto de no disponibilidad; el botón "Elegir otro profesional" está presente y navega a `/`
- [x] T027 [P] [US2] Crear `tests/e2e/app/booking-flow.test.ts`: test happy path (seleccionar Prof A → Servicio 1 → Confirmar → ver turno con fecha y hora); test sin disponibilidad (seleccionar Prof B con todos los slots llenos → ver mensaje "sin disponibilidad" → click "Elegir otro" → volver a `/`)

### Implementación User Story 2

- [x] T028 [US2] Actualizar `components/BookingClient.tsx`: cuando slot es null, mostrar Card con mensaje "No hay turnos disponibles en los próximos 14 días con este profesional" y botón "Elegir otro profesional" que navega a `/` (ya implementado en T024, verificar cobertura del estado null)
- [x] T029 [US2] Actualizar `data/bookings.json`: bookings de prueba existentes cumplen el requisito básico; cobertura completa del estado null probada en unit tests

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente.

---

## Phase 5: Ejercicio SDD — Stub del calendario

**Purpose**: Dejar preparado el punto de entrada del ejercicio SDD sin bloquear la funcionalidad existente.

- [x] T030 Crear `app/booking/[id]/calendar/page.tsx`: Server Component mínimo que pre-carga profesional, servicio y slots de la semana actual; renderiza un `<div>` con comentario `// TODO: implementar calendario de slots (ejercicio SDD)` y un link de vuelta; `notFound()` si profesional no existe

---

## Phase 6: Polish & Verificación final

**Purpose**: Garantizar calidad, cobertura y comportamiento responsivo.

- [x] T031 [P] Verificar cobertura: ejecutar `npx vitest run --coverage`; asegurar ≥80% en `lib/`, `components/`, `app/` (Estándares de Testing, constitución v1.2.0) → 95% statements, 86% branches, 98% lines
- [x] T032 [P] Verificar responsive: probar manualmente en 375px, 768px y 1280px; grid de profesionales debe ser 1 col / 2 col / 3 col respectivamente → verificado visualmente
- [x] T033 [P] Verificar no doble-booking: confirmar mismo slot dos veces → segundo intento retorna 400 "El horario ya está reservado" → verificado con fetch desde el navegador
- [x] T034 Ejecutar `npm run build` y verificar build limpio sin errores TypeScript ni warnings → build exitoso

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sin dependencias — iniciar inmediatamente
- **Phase 2 (Foundational)**: Depende de Phase 1 — BLOQUEA todas las user stories
- **Phase 3 (US1)**: Depende de Phase 2 — tests primero, luego implementación
- **Phase 4 (US2)**: Depende de Phase 2 — puede ejecutarse en paralelo con Phase 3 si hay capacidad
- **Phase 5 (Stub)**: Depende de Phase 3 completada
- **Phase 6 (Polish)**: Depende de todas las fases anteriores

### Within Each Phase

1. Tests DEBEN escribirse y FALLAR antes de la implementación
2. `lib/` antes de `components/`
3. Componentes atómicos (ServiceBadge) antes de moleculares (ProfessionalCard)
4. Componentes antes de pages
5. Pages antes de e2e tests

### Parallel Opportunities

```bash
# Phase 1 — todo en paralelo después de T001:
T002, T003, T004

# Phase 2 — en paralelo:
T006, T007 (después de T005)
T010, T011 (independientes)

# Phase 3 — tests todos en paralelo (T012–T017):
T012, T013, T014, T015, T016, T017

# Phase 3 — implementación en orden:
T018 → T019 → T020 → T021
T022 → T023 → T024 → T025
```

---

## Implementation Strategy

### MVP (User Story 1 solamente)

1. Phase 1: Setup de testing
2. Phase 2: Foundational
3. Phase 3: US1 completo (tests + implementación)
4. **Validar independientemente** → demo funcional

### Entrega incremental

1. Phase 1 + 2 → base lista
2. Phase 3 → MVP demostrable
3. Phase 4 → manejo de error de disponibilidad
4. Phase 5 → ejercicio SDD preparado
5. Phase 6 → polish final

---

## Notes

- `[P]` = archivos distintos, sin dependencias incompletas entre sí
- `[USN]` = traza la tarea a la user story correspondiente del spec
- Cada fase debe ser independientemente verificable antes de avanzar
- **NUNCA** modificar un test para que pase sin validar si el test o la implementación es el problema (Constitución, Estándares de Testing v1.2.0)
- Los IDs de nuevos bookings DEBEN generarse con `crypto.randomUUID()` en el servidor (Principio VII)
