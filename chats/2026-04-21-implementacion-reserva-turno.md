# Chat: Implementación completa — Reserva de Turno (Cliente)
**Fecha**: 2026-04-21  
**Rama**: main  
**Tarea origen**: `/speckit-implement` sobre `specs/001-reserva-turno-cliente/tasks.md`

---

## Resumen ejecutivo

Se completó la implementación íntegra del flujo de reserva de turnos para el cliente (US1 + US2 + stub SDD). El proyecto quedó con 55 tests unitarios pasando, 95% de cobertura, build limpio y responsive verificado.

---

## Fases completadas

### Phase 1 — Setup de testing (T001–T004)
*(completado en sesión anterior)*
- `vitest.config.ts` con jsdom, globals, `@vitejs/plugin-react`, alias `@/`
- `playwright.config.ts` apuntando a `http://localhost:3000`, Chromium + Pixel 5
- Estructura `tests/unit/{lib,components,app}/` y `tests/e2e/app/`
- Scripts en `package.json`: `test`, `test:watch`, `test:coverage`, `test:e2e`

### Phase 2 — Foundational (T005–T011)
- **T005**: `data/services.json` expandido a 6 servicios (svc-4 Diseño de barba, svc-5 Corte de ceja, svc-6 Alisado/keratina)
- **T006**: `data/professionals.json` con campo `targetAudience` añadido a cada profesional
- **T007**: `lib/types.ts` — nuevo tipo `TargetAudience = "men" | "women" | "children"` y campo `targetAudience: TargetAudience[]` en `Professional`
- **T008**: `app/api/bookings/route.ts` — `id: crypto.randomUUID()` (reemplaza `book-${Date.now()}`)
- **T009**: `lib/api.ts` — funciones cliente: `getProfessionals`, `getProfessional`, `getServices`, `getBookings`, `createBooking` con timeout 3000ms y `AbortController`
- **T010**: `app/not-found.tsx` — 404 con `buttonVariants` + `Link`
- **T011**: `app/error.tsx` — 500 client component con `reset` prop

### Phase 3 — US1: Reservar turno (T012–T025)

#### Tests escritos primero (todos fallaban antes de implementar)
- `tests/unit/lib/slots.test.ts` — `getAvailableSlots` y `getNextAvailableSlot` (7 casos)
- `tests/unit/components/ServiceBadge.test.tsx`
- `tests/unit/components/ProfessionalCard.test.tsx`
- `tests/unit/app/page.test.tsx` (testea `BookingSelector`)
- `tests/unit/components/BookingConfirmation.test.tsx`
- `tests/unit/app/booking-page.test.tsx` (testea `BookingClient`)

#### Implementación
- `lib/data.ts` — funciones servidor con `fs` directo: `getProfessionals`, `getProfessional`, `getServices`, `getService`, `getBookings`
- `components/ServiceBadge.tsx` — `<button>` wrapper con `data-selected` + `Badge` shadcn
- `components/ProfessionalCard.tsx` — `Card` con `ServiceBadge` por cada `serviceId`
- `components/BookingSelector.tsx` (`"use client"`) — estado `selectedProfessionalId` + `selectedServiceId`, grid responsive, `useRouter` para navegar a `/booking/[id]?serviceId=[id]`
- `app/page.tsx` — Server Component, lee datos con `lib/data.ts`, pasa a `BookingSelector`
- `app/booking/[id]/page.tsx` — Server Component, `await params`, `await searchParams`, `notFound()` si profesional/servicio no existen, `getNextAvailableSlot()`, pasa a `BookingClient`
- `components/BookingConfirmation.tsx` — display Card con profesional, servicio, fecha en español, hora
- `components/BookingClient.tsx` (`"use client"`) — estados `idle/loading/success/error`, muestra resumen pre-confirmación, llama `createBooking()`, transiciona a `BookingConfirmation` en éxito, Card de "sin disponibilidad" si `nextSlot=null`
- `app/booking/[id]/error.tsx` — error específico con `reset` + link inicio
- `app/booking/[id]/calendar/page.tsx` — stub SDD: pre-carga profesional, servicio, slots del día, `// TODO: implementar calendario de slots (ejercicio SDD)`

### Phase 4 — US2: Sin disponibilidad (T026–T029)
- Tests de `BookingClient` con `nextSlot=null` ya cubiertos en T017/T026
- `tests/e2e/app/booking-flow.test.ts` creado (happy path + sin disponibilidad)
- `BookingClient` ya maneja el estado null desde T024

### Phase 5 — Stub SDD (T030)
- `app/booking/[id]/calendar/page.tsx` — punto de entrada del ejercicio

### Phase 6 — Polish (T031–T034)
- Cobertura: **95% statements, 86% branches, 98% lines** (threshold 80% ✅)
- Responsive: 375px → 1 col, 768px → 2 col, 1280px → 3 col ✅
- Anti-doble-booking: POST mismo slot dos veces → `201` + `400 "El horario ya está reservado"` ✅
- Build: `npm run build` limpio sin errores TypeScript ✅

---

## Decisiones técnicas importantes

### RSC vs Client Components
- **Server Components** (`app/page.tsx`, `app/booking/[id]/page.tsx`, `app/booking/[id]/calendar/page.tsx`): leen JSON directamente vía `lib/data.ts` con `fs`
- **Client Components** (`BookingSelector`, `BookingClient`): usan `lib/api.ts` que hace fetch a API Routes
- **Separación**: `lib/data.ts` = solo servidor; `lib/api.ts` = solo cliente. Los API Routes son la única interfaz para el cliente (Principio IV de la constitución)

### Next.js 16 — params como Promise
```typescript
// CORRECTO en Next.js 16
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ serviceId?: string }>
}) {
  const { id } = await params
  const { serviceId } = await searchParams
}
```

### Button sin asChild (base-ui, no Radix)
El componente `Button` usa `@base-ui/react/button`, que **no tiene prop `asChild`**. Para links con estilo de botón:
```tsx
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

<Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
  Texto
</Link>
```

### Cobertura — exclusiones válidas
`vitest.config.ts` excluye de coverage:
- `app/layout.tsx`, `app/page.tsx`, `app/booking/**` — Server Components cubiertos por e2e
- `components/ui/**` — componentes shadcn generados por terceros

### Tests de lib/data.ts
Los mocks de módulos Node built-in (`fs`, `path`) con `vi.mock` + `importOriginal` son inestables en Vitest. Solución adoptada: testear contra los archivos JSON reales del proyecto (integration-style unit tests).

---

## Estructura de archivos creados/modificados

```
app/
  page.tsx                          ← Server Component home
  not-found.tsx                     ← 404
  error.tsx                         ← 500 (client)
  booking/[id]/
    page.tsx                        ← Confirmación automática
    error.tsx                       ← Error específico reserva
    calendar/page.tsx               ← Stub ejercicio SDD

components/
  ServiceBadge.tsx
  ProfessionalCard.tsx
  BookingSelector.tsx               ← "use client"
  BookingConfirmation.tsx
  BookingClient.tsx                 ← "use client"

lib/
  types.ts                          ← + TargetAudience
  api.ts                            ← fetch client-side con timeout
  data.ts                           ← fs server-side
  slots.ts                          ← sin cambios

data/
  services.json                     ← 6 servicios
  professionals.json                ← + targetAudience
  bookings.json                     ← bookings de prueba

tests/
  unit/lib/
    slots.test.ts
    api.test.ts
    data.test.ts
  unit/components/
    ServiceBadge.test.tsx
    ProfessionalCard.test.tsx
    BookingConfirmation.test.tsx
  unit/app/
    page.test.tsx
    booking-page.test.tsx
    error-pages.test.tsx
  e2e/app/
    booking-flow.test.ts

vitest.config.ts                    ← exclude e2e, coverage thresholds
```

---

## Estado final del proyecto

| Ítem | Estado |
|---|---|
| 55 unit tests | ✅ todos pasan |
| Coverage statements | ✅ 95% |
| Coverage branches | ✅ 86% |
| Coverage lines | ✅ 98% |
| `npm run build` | ✅ sin errores |
| Responsive 375/768/1280px | ✅ 1/2/3 col |
| Anti-doble-booking | ✅ 400 en segundo intento |
| Flujo cliente completo | ✅ selección → confirmación → turno confirmado |
| Stub SDD listo | ✅ `app/booking/[id]/calendar/page.tsx` |

---

## Próximo paso para participantes del ejercicio

Implementar el calendario de slots en `app/booking/[id]/calendar/page.tsx`. El Server Component ya pre-carga:
- `professional` — datos del profesional
- `service` — servicio seleccionado  
- `slots` — array de `Slot[]` del día actual via `getAvailableSlots()`

El participante debe renderizar los slots, permitir seleccionar uno y llamar a `POST /api/bookings`.
