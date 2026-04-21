# Feature Specification: Reserva de Turno — Vista del Cliente

**Feature Branch**: `001-reserva-turno-cliente`
**Created**: 2026-04-21
**Status**: Draft
**Input**: User description: "Quiero agregar una vista para que un cliente pueda seleccionar un profesional para ir a la barbería, el usuario debe seleccionar que quiere hacerse y luego al enviar el sistema le devolverá el día y horario asignado"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Reservar un turno con profesional y servicio elegidos (Priority: P1)

Un cliente entra a la aplicación, ve los profesionales disponibles con sus servicios,
elige el que prefiere, selecciona el servicio que desea, y confirma. El sistema le
devuelve el próximo turno disponible con ese profesional para ese servicio, incluyendo
el día y la hora asignados.

**Why this priority**: Es el flujo principal y único objetivo de la vista. Sin este
flujo la funcionalidad no tiene valor.

**Independent Test**: Se puede probar abriendo la app, eligiendo cualquier profesional,
seleccionando cualquier servicio disponible para ese profesional y confirmando. Si al
final se muestra un día y horario asignados, la historia funciona de forma independiente.

**Acceptance Scenarios**:

1. **Given** el cliente está en la página principal, **When** carga la vista, **Then** ve una lista con todos los profesionales disponibles, cada uno mostrando su nombre, especialidad y los servicios que ofrece.

2. **Given** el cliente seleccionó un profesional, **When** elige un servicio de la lista de ese profesional, **Then** el botón de confirmar se habilita.

3. **Given** el cliente seleccionó profesional y servicio, **When** confirma la reserva, **Then** el sistema le muestra el día y la hora del próximo turno disponible con ese profesional para ese servicio.

4. **Given** se muestra la confirmación del turno, **Then** se incluye: nombre del profesional, nombre del servicio, fecha del turno (día y mes) y hora de inicio.

---

### User Story 2 — Sin disponibilidad en los próximos días (Priority: P2)

El cliente elige un profesional y servicio pero ese profesional no tiene turnos libres
en los próximos días.

**Why this priority**: Caso borde crítico para la experiencia del usuario. Sin manejo
explícito, el cliente queda en un estado indefinido.

**Independent Test**: Se puede simular bloqueando todos los horarios de un profesional
y verificando que al intentar reservar con él aparece un mensaje de no disponibilidad.

**Acceptance Scenarios**:

1. **Given** el profesional seleccionado no tiene turnos disponibles en los próximos 14 días, **When** el cliente confirma la reserva, **Then** el sistema muestra un mensaje claro indicando que no hay turnos disponibles próximamente.

2. **Given** se muestra el mensaje de no disponibilidad, **Then** el cliente puede volver a la lista de profesionales para elegir otro.

---

### Edge Cases

- ¿Qué pasa si el cliente intenta confirmar sin haber elegido servicio? → El botón de confirmar permanece deshabilitado; no se puede enviar el formulario incompleto.
- ¿Qué pasa si el profesional no ofrece el servicio seleccionado? → Solo se muestran los servicios que el profesional ofrece; no puede seleccionarse un servicio no disponible para ese profesional.
- ¿Qué pasa si la conexión falla al confirmar? → Se muestra un mensaje de error con opción de reintentar; no se crea ningún turno.
- ¿Qué pasa si el slot fue tomado por otro cliente entre la carga de la página y la confirmación? → El sistema detecta el conflicto, informa al cliente y le asigna el próximo slot disponible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar la lista completa de profesionales disponibles al ingresar a la vista.
- **FR-002**: Cada profesional DEBE mostrar su nombre, especialidad y la lista de servicios que ofrece.
- **FR-003**: El cliente DEBE poder seleccionar un profesional de la lista.
- **FR-004**: Al seleccionar un profesional, el sistema DEBE mostrar únicamente los servicios que ese profesional ofrece.
- **FR-005**: El cliente DEBE poder seleccionar un servicio de la lista del profesional elegido.
- **FR-006**: El sistema DEBE habilitar la acción de confirmar solo cuando tanto el profesional como el servicio estén seleccionados.
- **FR-007**: Al confirmar, el sistema DEBE calcular y asignar automáticamente el próximo turno disponible con ese profesional para ese servicio.
- **FR-008**: El sistema DEBE persistir la reserva para que el slot quede marcado como ocupado.
- **FR-009**: El sistema DEBE mostrar la confirmación con: nombre del profesional, servicio, fecha y hora del turno asignado.
- **FR-010**: Si no hay turnos disponibles en los próximos 14 días, el sistema DEBE informar al cliente con un mensaje claro.
- **FR-011**: El sistema DEBE permitir al cliente volver a la lista de profesionales desde cualquier estado del flujo.
- **FR-012**: Si ocurre un error al confirmar, el sistema DEBE mostrar un mensaje descriptivo y permitir reintentar sin perder la selección actual.

### Key Entities

- **Profesional**: Persona que presta el servicio. Tiene nombre, especialidad, lista de servicios disponibles y horario de trabajo propio.
- **Servicio**: Tipo de trabajo que puede realizarse (corte, barba, coloración, etc.). Tiene nombre y duración estimada.
- **Turno (Booking)**: Reserva creada al confirmar. Tiene profesional, servicio, cliente implícito en la sesión, fecha y hora.
- **Slot**: Intervalo de tiempo libre calculado a partir del horario del profesional y los turnos ya confirmados. No es persistido; se calcula en el momento.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El cliente puede completar el flujo completo (selección de profesional, servicio y confirmación) en menos de 2 minutos.
- **SC-002**: El 95% de los intentos de reserva exitosos se completan en menos de 3 segundos desde que el cliente confirma.
- **SC-003**: El 100% de los turnos confirmados se reflejan inmediatamente como ocupados para nuevas consultas (sin doble-booking).
- **SC-004**: El cliente recibe respuesta visual ante cualquier acción en menos de 1 segundo (feedback inmediato de carga o error).
- **SC-005**: El flujo funciona correctamente en dispositivos móviles (375px), tablets (768px) y escritorio (1280px) sin pérdida de funcionalidad.

## Assumptions

- El cliente no necesita crear una cuenta ni autenticarse para reservar un turno en esta primera versión del flujo.
- El nombre del cliente se solicitará en la pantalla de confirmación (fuera del alcance de esta especificación) o se captura mínimamente para identificar la reserva.
- La duración de cada servicio es fija y conocida por el sistema; el cliente no la configura.
- El sistema busca disponibilidad en los próximos 14 días calendario desde el momento de la reserva.
- Si múltiples slots están disponibles el mismo día, el sistema asigna el primero cronológicamente.
- El cliente no puede elegir un día/hora específicos en esta versión; la asignación es automática (el ejercicio SDD ampliará esto con un calendario).
- Se asume conectividad de red estable del lado del cliente; el timeout máximo de respuesta es de 3 segundos.
