# API Contracts: Reserva de Turno — Vista del Cliente

## Endpoints utilizados por esta feature

### GET /api/professionals

Retorna la lista de todos los profesionales con sus servicios expandidos.

**Request**: sin parámetros

**Response 200**:
```json
[
  {
    "id": "prof-1",
    "name": "Carlos Méndez",
    "role": "Barbero Senior",
    "bio": "...",
    "avatar": "/avatars/carlos.jpg",
    "serviceIds": ["svc-1", "svc-2", "svc-4", "svc-5"],
    "targetAudience": ["men", "children"],
    "workingHours": { ... }
  }
]
```

---

### GET /api/services

Retorna todos los servicios disponibles.

**Request**: sin parámetros

**Response 200**:
```json
[
  { "id": "svc-1", "name": "Corte de cabello", "duration": 30, "price": 500 },
  { "id": "svc-2", "name": "Corte + barba",    "duration": 45, "price": 800 },
  { "id": "svc-3", "name": "Coloración",        "duration": 60, "price": 1500 },
  { "id": "svc-4", "name": "Diseño de barba",   "duration": 30, "price": 600 },
  { "id": "svc-5", "name": "Corte de ceja",     "duration": 15, "price": 300 },
  { "id": "svc-6", "name": "Alisado / keratina","duration": 90, "price": 3500 }
]
```

---

### GET /api/bookings?professionalId={id}&date={YYYY-MM-DD}

Retorna las reservas de un profesional en una fecha dada.
Usado internamente por la lógica de slots para calcular disponibilidad.

**Query params**:
- `professionalId` (string, requerido): ID del profesional
- `date` (string YYYY-MM-DD, opcional): filtra por fecha

**Response 200**: `Booking[]`

---

### POST /api/bookings

Crea una nueva reserva. Verifica disponibilidad del slot antes de persistir.

**Request body**:
```json
{
  "professionalId": "prof-1",
  "serviceId": "svc-1",
  "clientName": "Juan Pérez",
  "clientPhone": "11-1234-5678",
  "date": "2026-04-23",
  "startTime": "09:00",
  "endTime": "09:30"
}
```

**Response 201** (turno creado):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "professionalId": "prof-1",
  "serviceId": "svc-1",
  "clientName": "Juan Pérez",
  "clientPhone": "11-1234-5678",
  "date": "2026-04-23",
  "startTime": "09:00",
  "endTime": "09:30",
  "status": "confirmed"
}
```

**Response 400** (slot ocupado o datos faltantes):
```json
{ "error": "El horario ya está reservado" }
```

**Response 400** (campos faltantes):
```json
{ "error": "Todos los campos son requeridos" }
```

---

## Contratos de vistas (UI)

### Página principal `/`

**Entrada**: ninguna (datos cargados en el servidor)
**Datos pre-cargados**: `Professional[]` + `Service[]`
**Estado local (client)**: `selectedProfessionalId | null`, `selectedServiceId | null`
**Acción**: botón "Confirmar" → navega a `/booking/[professionalId]?serviceId=[serviceId]`

### Página de confirmación `/booking/[id]`

**Entrada**: `params.id` (professionalId), `searchParams.serviceId`
**Datos pre-cargados**: `Professional`, `Service`, siguiente slot disponible
**Renderiza**: resumen del turno asignado
**Acción**: botón "Confirmar turno" → `POST /api/bookings` → muestra confirmación
**Error 404**: si el profesional no existe → `notFound()`
**Error 400/500**: si falla el POST → muestra mensaje de error con opción de reintentar

### Página de ejercicio SDD `/booking/[id]/calendar`

**Entrada**: `params.id` (professionalId), `searchParams.serviceId`
**Datos pre-cargados**: `Professional`, `Service`, `Slot[]` de la semana actual
**Estado**: vacío — punto de entrada del ejercicio
