# Implementation Plan: Reserva de Turno — Vista del Cliente

**Branch**: `001-reserva-turno-cliente` | **Date**: 2026-04-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/001-reserva-turno-cliente/spec.md`

## Summary

Implementar la vista del cliente para reservar turnos de barbería. El cliente
selecciona un profesional y un servicio; el sistema asigna automáticamente el
próximo slot disponible y muestra la confirmación. Se adaptan los datos existentes
para reflejar el dominio completo (nuevos servicios y campo `targetAudience`).

## Technical Context

**Language/Version**: TypeScript 5 / Next.js 16.2.4 (App Router)
**Primary Dependencies**: React 19, shadcn/ui (base-nova), Tailwind CSS v4, Vitest, Playwright
**Storage**: JSON files en `data/` accedidos via API Routes de Next.js
**Testing**: Vitest (unit/integration), Playwright (e2e)
**Target Platform**: Web (mobile-first, responsive 375px / 768px / 1280px)
**Project Type**: Frontend web app
**Performance Goals**: Confirmación de turno < 3s (p95); respuesta visual < 1s
**Constraints**: Sin auth requerida; slot asignado automáticamente (sin elección manual de fecha)
**Scale/Scope**: 3 profesionales, 6 servicios, 1 semana de slots visibles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Test-First** — Tests escritos antes de implementar cada componente
- [x] **II. shadcn UI** — ProfessionalCard, ServiceSelector, BookingConfirmation usan shadcn Card, Badge, Button
- [x] **III. Atómico** — Componentes separados por responsabilidad; lógica de slots en `lib/slots.ts`
- [x] **IV. API Express** — Fetch encapsulado en `lib/api.ts`; no fetch directo desde componentes
- [x] **V. Performance** — POST /api/bookings con timeout de 3s; estados loading/error/empty en BookingClient
- [x] **VI. Rutas** — `/`, `/booking/[id]`, `/booking/[id]/calendar`, `/api/*` en kebab-case
- [x] **VII. UUID** — Nuevos bookings generados con `crypto.randomUUID()` en servidor
- [x] **VIII. Zero Trust** — Validación en API Route; `params` y `searchParams` validados en pages
- [x] **IX. Renderizado Next.js** — Pages son RSC; `BookingSelector` y `BookingClient` tienen `"use client"`
- [x] **X. Responsive** — Mobile-first con Tailwind; grid de profesionales col-1 en móvil / col-2 en md / col-3 en lg
- [x] **XI. Middleware-First** — Datos pre-cargados en Server Components; `notFound()` si profesional no existe; `error.tsx` para fallos inesperados

## Project Structure

### Documentation (this feature)

```text
specs/001-reserva-turno-cliente/
├── plan.md           ← este archivo
├── spec.md
├── research.md
├── data-model.md
├── contracts/
│   └── api-contracts.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
data/
  services.json         ← MODIFICAR: agregar svc-4, svc-5, svc-6
  professionals.json    ← MODIFICAR: agregar targetAudience, expandir serviceIds

lib/
  types.ts              ← MODIFICAR: agregar TargetAudience a Professional
  slots.ts              ← ya existe, sin cambios
  api.ts                ← CREAR: funciones de fetch al servidor

app/
  page.tsx              ← REEMPLAZAR: lista de profesionales (RSC)
  error.tsx             ← CREAR: pantalla de error global (500)
  not-found.tsx         ← CREAR: pantalla 404 global
  layout.tsx            ← sin cambios
  booking/
    [id]/
      page.tsx          ← CREAR: confirmación automática (RSC + middleware-first)
      error.tsx         ← CREAR: error de confirmación
      calendar/
        page.tsx        ← CREAR: stub vacío (punto de entrada del ejercicio SDD)

components/
  ProfessionalCard.tsx  ← CREAR: card de profesional con selección de servicio
  ServiceBadge.tsx      ← CREAR: badge de servicio seleccionable
  BookingConfirmation.tsx ← CREAR: resumen del turno confirmado
  BookingSelector.tsx   ← CREAR: client component orquestador de selección + POST

tests/
  unit/
    lib/
      slots.test.ts     ← CREAR: tests de getAvailableSlots y getNextAvailableSlot
    components/
      ProfessionalCard.test.tsx  ← CREAR
      ServiceBadge.test.tsx      ← CREAR
      BookingConfirmation.test.tsx ← CREAR
    app/
      page.test.tsx              ← CREAR: render de lista de profesionales
      booking-page.test.tsx      ← CREAR: render de confirmación y estados de error
  e2e/
    app/
      booking-flow.test.ts       ← CREAR: flujo completo happy path + no disponibilidad
```

## Fase 1 — Adaptar datos y tipos

### Tareas

1. Actualizar `data/services.json`: agregar svc-4 (Diseño de barba, 30min, $600), svc-5 (Corte de ceja, 15min, $300), svc-6 (Alisado/keratina, 90min, $3500).
2. Actualizar `data/professionals.json`: agregar campo `targetAudience` y expandir `serviceIds` según `data-model.md`.
3. Actualizar `lib/types.ts`: agregar `TargetAudience = "men" | "women" | "children"` y el campo `targetAudience: TargetAudience[]` en `Professional`.
4. Actualizar `app/api/bookings/route.ts`: usar `crypto.randomUUID()` para el campo `id` de nuevas reservas (Principio VII).

## Fase 2 — Tests (escribir antes de implementar)

### Regla

Cada test DEBE ejecutarse y FALLAR antes de que exista la implementación correspondiente.

### Tests unitarios (`tests/unit/`)

- `lib/slots.test.ts`: `getAvailableSlots` con profesional sin bookings, con slots parcialmente ocupados, con día libre (`null`). `getNextAvailableSlot` encontrando slot en día siguiente.
- `components/ProfessionalCard.test.tsx`: renderiza nombre, rol, bio, badges de servicios.
- `components/ServiceBadge.test.tsx`: renderiza nombre del servicio, aplica estilo seleccionado/no-seleccionado.
- `components/BookingConfirmation.test.tsx`: muestra profesional, servicio, fecha y hora del turno.
- `app/page.test.tsx`: renderiza lista de profesionales con sus servicios.
- `app/booking-page.test.tsx`: renderiza confirmación con slot asignado; muestra error 404 si profesional no existe; muestra estado de no disponibilidad.

### Tests e2e (`tests/e2e/`)

- `booking-flow.test.ts`: flujo completo happy path (seleccionar profesional → servicio → confirmar → ver turno asignado).
- `booking-flow.test.ts`: flujo de no disponibilidad (profesional sin slots → mensaje claro → volver a lista).

## Fase 3 — Implementación

### Orden de implementación (respetar dependencias)

1. `lib/api.ts` — funciones de fetch (sin UI)
2. `components/ServiceBadge.tsx` — átomo base
3. `components/ProfessionalCard.tsx` — molécula que usa ServiceBadge
4. `components/BookingSelector.tsx` — client component orquestador
5. `app/page.tsx` — RSC que pre-carga datos y pasa a BookingSelector
6. `app/not-found.tsx` y `app/error.tsx` — páginas de error globales
7. `app/booking/[id]/page.tsx` — RSC con middleware-first (datos + notFound)
8. `components/BookingConfirmation.tsx` — presentación del turno asignado
9. `app/booking/[id]/error.tsx` — error específico de confirmación
10. `app/booking/[id]/calendar/page.tsx` — stub del ejercicio

## Fase 4 — Verificación

1. `npm run build` — build limpio sin errores TypeScript
2. `npm run dev` — servidor local levanta
3. Verificar manualmente en 375px, 768px y 1280px
4. Ejecutar tests: `npx vitest run`
5. Ejecutar e2e: `npx playwright test`
6. Verificar no doble-booking: confirmar mismo slot dos veces → segundo devuelve error 400
