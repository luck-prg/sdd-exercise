# Quickstart: Reserva de Turno — Vista del Cliente

## Prerrequisitos

```bash
node -v  # >= 18
npm install
```

## Levantar el proyecto

```bash
npm run dev
# → http://localhost:3000
```

## Flujo de validación manual

1. Abrir `http://localhost:3000` → ver lista de 3 profesionales con sus servicios
2. Click en un profesional → ver badge de servicios habilitados para ese profesional
3. Seleccionar un servicio → botón "Continuar" se habilita
4. Click "Continuar" → navegar a `/booking/[id]?serviceId=[id]`
5. Ver resumen: profesional, servicio, fecha y hora asignados automáticamente
6. Click "Confirmar turno" → ver pantalla de confirmación exitosa
7. Intentar confirmar el mismo slot → respuesta 400 "El horario ya está reservado"

## Endpoints disponibles para testing manual

```
GET  http://localhost:3000/api/professionals
GET  http://localhost:3000/api/services
GET  http://localhost:3000/api/bookings?professionalId=prof-1
POST http://localhost:3000/api/bookings
```

## Ejecutar tests

```bash
# Unit + integration
npx vitest run

# Watch mode
npx vitest

# E2E (requiere servidor corriendo)
npx playwright test
```

## Estructura de archivos clave

```
lib/
  types.ts    ← tipos de dominio
  slots.ts    ← lógica de disponibilidad
  api.ts      ← funciones de fetch al servidor

data/
  professionals.json  ← base de datos de profesionales
  services.json       ← base de datos de servicios
  bookings.json       ← reservas existentes

app/
  page.tsx                        ← lista de profesionales (/)
  booking/[id]/page.tsx           ← confirmación automática
  booking/[id]/calendar/page.tsx  ← STUB del ejercicio SDD
```
