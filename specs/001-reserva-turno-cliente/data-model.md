# Data Model: Reserva de Turno — Vista del Cliente

## Entidades y estructura de datos

### Service (actualizado)

```typescript
type Service = {
  id: string            // UUID v4 (existentes: "svc-1" a "svc-6")
  name: string          // Nombre legible del servicio
  duration: number      // Duración en minutos
  price: number         // Precio en ARS
}
```

**Registros completos:**

| id    | name                  | duration | price |
|-------|-----------------------|----------|-------|
| svc-1 | Corte de cabello      | 30       | 500   |
| svc-2 | Corte + barba         | 45       | 800   |
| svc-3 | Coloración            | 60       | 1500  |
| svc-4 | Diseño de barba       | 30       | 600   |
| svc-5 | Corte de ceja         | 15       | 300   |
| svc-6 | Alisado / keratina    | 90       | 3500  |

---

### Professional (actualizado)

```typescript
type TargetAudience = "men" | "women" | "children"

type Professional = {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  serviceIds: string[]           // Referencias a Service.id
  targetAudience: TargetAudience[] // Nuevo campo: público atendido
  workingHours: Record<WeekDay, WorkingDay>
}
```

**Cambio**: se agrega `targetAudience: string[]` a cada profesional.

**Profesionales actualizados:**

- **Carlos Méndez**: targetAudience: ["men", "children"], serviceIds: ["svc-1", "svc-2", "svc-4", "svc-5"]
- **Valentina López**: targetAudience: ["women", "children"], serviceIds: ["svc-1", "svc-3", "svc-5", "svc-6"]
- **Martín García**: targetAudience: ["men"], serviceIds: ["svc-1", "svc-2", "svc-4"]

---

### Booking (sin cambios estructurales)

```typescript
type Booking = {
  id: string              // crypto.randomUUID() en nuevos registros
  professionalId: string
  serviceId: string
  clientName: string
  clientPhone: string
  date: string            // YYYY-MM-DD
  startTime: string       // HH:mm
  endTime: string         // HH:mm
  status: "confirmed" | "cancelled"
}
```

---

### Slot (calculado, no persistido)

```typescript
type Slot = {
  startTime: string
  endTime: string
  available: boolean
}
```

Derivado en `lib/slots.ts` a partir de `workingHours` del profesional y bookings confirmados del día.

---

## Relaciones

```
Professional (1) ──── (N) Booking
Service      (1) ──── (N) Booking
Professional (N) ──── (N) Service  [via serviceIds]
```

## Reglas de integridad

- Un `professionalId` en Booking DEBE existir en `professionals.json`.
- Un `serviceId` en Booking DEBE existir en `services.json`.
- El `serviceId` DEBE estar en el array `serviceIds` del profesional.
- No pueden existir dos Bookings `confirmed` con mismo `professionalId`, `date` y `startTime`.
- `startTime` calculado como `workingHours.start + N * service.duration` del día.
