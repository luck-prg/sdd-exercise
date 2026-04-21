# Ejercicio: Extensión del gestor de turnos

Este documento define las features a implementar, los contratos de API, y los cambios en la capa de datos. El objetivo es practicar **SDD (Specification-Driven Development)**: escribir el spec antes de tocar el código.

---

## Flujo principal rediseñado

El flujo actual (profesional → servicio → calendario) se reemplaza por uno centrado en el cliente:

```
1. Selección de servicios   → uno o más servicios
2. Selección de día         → calendario con días disponibles
3. Selección de horario     → slots calculados según duración total
4. Selección de profesional → filtrado por servicios + disponibilidad en ese slot
5. Confirmación             → datos del cliente y resumen
```

**Regla de negocio central:** un profesional es elegible si y solo si:
- Tiene **todos** los servicios seleccionados en su `serviceIds`
- Trabaja el día de la semana seleccionado (su `workingHours` no es `null`)
- Tiene el slot libre (no hay turno confirmado que se solape con el rango `startTime → startTime + duración total`)
- No tiene un bloqueo de agenda que cubra ese slot

---

## Cambios en la capa de datos

### 1. `data/bookings.json` — migración de `serviceId` a `serviceIds`

El campo `serviceId: string` pasa a ser `serviceIds: string[]` para soportar múltiples servicios por turno.

```json
{
  "id": "book-1",
  "professionalId": "prof-1",
  "serviceIds": ["svc-1", "svc-5"],
  "clientName": "Juan Pérez",
  "clientPhone": "11-4523-1234",
  "date": "2026-04-21",
  "startTime": "09:00",
  "endTime": "09:45",
  "status": "confirmed"
}
```

> `endTime` se calcula como `startTime + suma de duración de todos los `serviceIds`.

### 2. `data/blocked-slots.json` — nuevo archivo

Almacena franjas bloqueadas por un profesional (feriados, reuniones, descansos).

```json
[
  {
    "id": "block-1",
    "professionalId": "prof-1",
    "date": "2026-04-30",
    "startTime": null,
    "endTime": null,
    "reason": "Feriado"
  },
  {
    "id": "block-2",
    "professionalId": "prof-2",
    "date": "2026-04-25",
    "startTime": "14:00",
    "endTime": "16:00",
    "reason": "Reunión de equipo"
  }
]
```

**Reglas:**
- Si `startTime` y `endTime` son `null`, el profesional está bloqueado **todo el día**.
- Si tienen valor, solo ese rango está bloqueado.

---

## API a implementar

Las rutas siguen el mismo patrón que el proyecto: archivos JSON como capa de persistencia, leídos/escritos con `fs`.

---

### `GET /api/availability`

Devuelve los slots disponibles para una fecha y duración dada. Puede filtrar por profesional.

**Query params:**

| Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `date` | `string` (YYYY-MM-DD) | ✅ | Día a consultar |
| `serviceIds` | `string` (CSV) | ✅ | IDs separados por coma. Ej: `svc-1,svc-5` |
| `professionalId` | `string` | ❌ | Si se omite, devuelve resultados para todos los profesionales elegibles |

**Ejemplo de request:**
```
GET /api/availability?date=2026-04-25&serviceIds=svc-1,svc-4
```

**Ejemplo de respuesta `200 OK`:**
```json
[
  {
    "professionalId": "prof-1",
    "date": "2026-04-25",
    "totalDuration": 60,
    "slots": [
      { "startTime": "09:00", "endTime": "10:00", "available": true },
      { "startTime": "10:00", "endTime": "11:00", "available": false },
      { "startTime": "11:00", "endTime": "12:00", "available": true }
    ]
  },
  {
    "professionalId": "prof-3",
    "date": "2026-04-25",
    "totalDuration": 60,
    "slots": [
      { "startTime": "10:00", "endTime": "11:00", "available": true },
      { "startTime": "11:00", "endTime": "12:00", "available": true }
    ]
  }
]
```

**Lógica interna:**
1. Calcular `totalDuration` = suma de `duration` de cada serviceId
2. Para cada profesional:
   a. Verificar que tenga **todos** los serviceIds en su lista
   b. Obtener el horario del día de la semana de `date`
   c. Si el profesional no trabaja ese día → excluirlo
   d. Si hay un bloqueo de día completo → excluirlo
   e. Generar slots de `totalDuration` minutos desde `workingHours.start` hasta `workingHours.end`
   f. Marcar cada slot como `available: false` si:
      - Hay un turno confirmado que se solapa
      - Hay un bloqueo parcial que cubre ese rango

**Respuestas de error:**

```json
// 400 — parámetros faltantes
{ "error": "Los parámetros date y serviceIds son requeridos" }

// 400 — ningún servicio encontrado
{ "error": "Uno o más serviceIds no existen" }

// 404 — professionalId no existe (cuando se especifica)
{ "error": "Profesional no encontrado" }
```

---

### `GET /api/bookings/[id]`

Devuelve un turno por su ID. Usado en la pantalla de cancelación del cliente.

**Ejemplo de respuesta `200 OK`:**
```json
{
  "id": "book-1",
  "professionalId": "prof-1",
  "serviceIds": ["svc-1", "svc-5"],
  "clientName": "Juan Pérez",
  "clientPhone": "11-4523-1234",
  "date": "2026-04-21",
  "startTime": "09:00",
  "endTime": "09:45",
  "status": "confirmed"
}
```

**Respuestas de error:**
```json
// 404
{ "error": "Turno no encontrado" }
```

---

### `PATCH /api/bookings/[id]`

Cancela un turno. Solo permite modificar el campo `status`.

**Body:**
```json
{ "status": "cancelled" }
```

**Reglas de negocio:**
- Si el turno ya está cancelado → `400`
- Si la fecha + `startTime` del turno es dentro de las próximas 2 horas → `409`
- Solo se acepta `"cancelled"` como valor de `status`

**Respuesta `200 OK`:**
```json
{
  "id": "book-1",
  "status": "cancelled"
}
```

**Respuestas de error:**
```json
// 400 — ya cancelado
{ "error": "El turno ya fue cancelado" }

// 400 — status inválido
{ "error": "El único estado permitido es cancelled" }

// 409 — demasiado tarde para cancelar
{ "error": "No se puede cancelar un turno con menos de 2 horas de anticipación" }

// 404 — no existe
{ "error": "Turno no encontrado" }
```

---

### `GET /api/blocked-slots`

Devuelve los bloqueos de agenda, opcionalmente filtrados.

**Query params:**

| Param | Tipo | Requerido | Descripción |
|---|---|---|---|
| `professionalId` | `string` | ❌ | Filtrar por profesional |
| `date` | `string` (YYYY-MM-DD) | ❌ | Filtrar por fecha |

**Ejemplo de respuesta `200 OK`:**
```json
[
  {
    "id": "block-1",
    "professionalId": "prof-1",
    "date": "2026-04-30",
    "startTime": null,
    "endTime": null,
    "reason": "Feriado"
  }
]
```

---

### `POST /api/blocked-slots`

Crea un bloqueo de agenda (uso interno / admin).

**Body:**
```json
{
  "professionalId": "prof-2",
  "date": "2026-05-01",
  "startTime": "13:00",
  "endTime": "15:00",
  "reason": "Capacitación"
}
```

**Validaciones:**
- `professionalId` y `date` son requeridos
- Si se provee `startTime`, `endTime` también es requerido (y viceversa)
- `startTime` debe ser anterior a `endTime`
- No puede solaparse con un bloqueo existente del mismo profesional en esa fecha

**Respuesta `201 Created`:**
```json
{
  "id": "block-3",
  "professionalId": "prof-2",
  "date": "2026-05-01",
  "startTime": "13:00",
  "endTime": "15:00",
  "reason": "Capacitación"
}
```

**Respuestas de error:**
```json
// 400 — campos faltantes
{ "error": "professionalId y date son requeridos" }

// 400 — startTime sin endTime
{ "error": "startTime y endTime deben especificarse juntos" }

// 400 — rango inválido
{ "error": "startTime debe ser anterior a endTime" }

// 409 — solapamiento
{ "error": "Ya existe un bloqueo que cubre ese rango" }

// 404 — profesional inexistente
{ "error": "Profesional no encontrado" }
```

---

## Features opcionales (mayor complejidad)

### Feature A — "Cualquier profesional disponible"

En el paso 4 del flujo, agregar la opción "Me da igual". El sistema selecciona automáticamente el profesional con **menos turnos confirmados ese día** entre los elegibles.

Nueva respuesta esperada del endpoint de creación cuando `professionalId` no se especifica:
```json
// POST /api/bookings body sin professionalId
{
  "serviceIds": ["svc-1"],
  "clientName": "Ana García",
  "clientPhone": "11-1234-5678",
  "date": "2026-04-28",
  "startTime": "10:00"
}
// El sistema elige el profesional y lo devuelve en el 201
```

### Feature B — Panel de administración (solo lectura)

Ruta `/admin` que muestra todos los turnos del día actual, agrupados por profesional. No requiere nuevas APIs — usa las existentes con `GET /api/bookings?date=`.

### Feature C — Estado `"completed"`

Agregar `"completed"` como tercer `BookingStatus`. Solo se puede marcar como completado un turno `confirmed` cuya fecha/hora ya pasó.

---

## Tipos TypeScript nuevos/modificados

```typescript
// Modificación: serviceId → serviceIds
export type Booking = {
  id: string
  professionalId: string
  serviceIds: string[]        // era: serviceId: string
  clientName: string
  clientPhone: string
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
}

export type BookingStatus = "confirmed" | "cancelled" | "completed"

// Nuevo tipo
export type BlockedSlot = {
  id: string
  professionalId: string
  date: string
  startTime: string | null
  endTime: string | null
  reason: string
}

// Nuevo tipo para la respuesta de disponibilidad
export type ProfessionalAvailability = {
  professionalId: string
  date: string
  totalDuration: number
  slots: Slot[]
}

// CreateBookingInput actualizado
export type CreateBookingInput = {
  professionalId?: string     // opcional para "cualquier profesional"
  serviceIds: string[]
  clientName: string
  clientPhone: string
  date: string
  startTime: string
}
```

---

## Orden de implementación sugerido para SDD

| # | Tarea | Dependencias |
|---|---|---|
| 1 | Migrar `bookings.json` a `serviceIds[]` | — |
| 2 | Crear `blocked-slots.json` con datos de ejemplo | — |
| 3 | Actualizar tipos en `lib/types.ts` | 1, 2 |
| 4 | `GET /api/bookings/[id]` | 3 |
| 5 | `PATCH /api/bookings/[id]` (cancelación) | 4 |
| 6 | `GET /api/blocked-slots` | 3 |
| 7 | `POST /api/blocked-slots` | 6 |
| 8 | `GET /api/availability` | 3, 6 |
| 9 | Rediseñar flujo de booking (UI) | 8 |
| 10 | Pantalla de cancelación del cliente | 5 |
| 11 | Feature A — "Cualquier profesional" | 8, POST /api/bookings |
| 12 | Feature B — Panel admin | 4 |
| 13 | Feature C — Estado `completed` | 5 |
