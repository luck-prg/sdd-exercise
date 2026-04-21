import type { Professional, Booking, Slot, WeekDay } from "./types"

const WEEK_DAYS: WeekDay[] = [
  "sunday" as WeekDay,
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function getAvailableSlots(
  professional: Professional,
  bookings: Booking[],
  date: string,
  serviceDuration: number
): Slot[] {
  const dayIndex = new Date(date + "T00:00:00").getDay()
  const dayName = WEEK_DAYS[dayIndex]
  const workingDay = professional.workingHours[dayName]

  if (!workingDay) return []

  const startMinutes = timeToMinutes(workingDay.start)
  const endMinutes = timeToMinutes(workingDay.end)

  const confirmedBookings = bookings.filter(
    (b) => b.professionalId === professional.id && b.date === date && b.status === "confirmed"
  )

  const slots: Slot[] = []
  let current = startMinutes

  while (current + serviceDuration <= endMinutes) {
    const slotStart = minutesToTime(current)
    const slotEnd = minutesToTime(current + serviceDuration)

    const occupied = confirmedBookings.some((b) => {
      const bStart = timeToMinutes(b.startTime)
      const bEnd = timeToMinutes(b.endTime)
      return current < bEnd && current + serviceDuration > bStart
    })

    slots.push({ startTime: slotStart, endTime: slotEnd, available: !occupied })
    current += serviceDuration
  }

  return slots
}

export function getNextAvailableSlot(
  professional: Professional,
  bookings: Booking[],
  serviceDuration: number,
  fromDate: Date = new Date()
): { date: string; slot: Slot } | null {
  for (let i = 0; i < 14; i++) {
    const date = new Date(fromDate)
    date.setDate(fromDate.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]

    const slots = getAvailableSlots(professional, bookings, dateStr, serviceDuration)
    const available = slots.find((s) => s.available)
    if (available) return { date: dateStr, slot: available }
  }
  return null
}
