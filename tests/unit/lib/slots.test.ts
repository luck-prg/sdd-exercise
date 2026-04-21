import { describe, it, expect } from "vitest"
import { getAvailableSlots, getNextAvailableSlot } from "@/lib/slots"
import type { Professional, Booking } from "@/lib/types"

const professional: Professional = {
  id: "prof-1",
  name: "Carlos Méndez",
  role: "Barbero Senior",
  bio: "Bio",
  avatar: "/avatars/carlos.jpg",
  serviceIds: ["svc-1"],
  targetAudience: ["men"],
  workingHours: {
    monday:    { start: "09:00", end: "12:00" },
    tuesday:   { start: "09:00", end: "12:00" },
    wednesday: { start: "09:00", end: "12:00" },
    thursday:  { start: "09:00", end: "12:00" },
    friday:    { start: "09:00", end: "12:00" },
    saturday:  null,
  },
}

describe("getAvailableSlots", () => {
  it("retorna todos los slots disponibles cuando no hay bookings", () => {
    // 2026-04-20 es lunes: horario 09:00–12:00, duración 30min → 6 slots
    const slots = getAvailableSlots(professional, [], "2026-04-20", 30)
    expect(slots).toHaveLength(6)
    expect(slots.every((s) => s.available)).toBe(true)
    expect(slots[0].startTime).toBe("09:00")
    expect(slots[0].endTime).toBe("09:30")
  })

  it("marca como no disponible un slot que tiene booking confirmado", () => {
    const booking: Booking = {
      id: "b1",
      professionalId: "prof-1",
      serviceId: "svc-1",
      clientName: "Juan",
      clientPhone: "1234",
      date: "2026-04-20",
      startTime: "09:00",
      endTime: "09:30",
      status: "confirmed",
    }
    const slots = getAvailableSlots(professional, [booking], "2026-04-20", 30)
    expect(slots[0].available).toBe(false)
    expect(slots[1].available).toBe(true)
  })

  it("no marca como ocupado un slot con booking cancelado", () => {
    const booking: Booking = {
      id: "b2",
      professionalId: "prof-1",
      serviceId: "svc-1",
      clientName: "Ana",
      clientPhone: "5678",
      date: "2026-04-20",
      startTime: "09:00",
      endTime: "09:30",
      status: "cancelled",
    }
    const slots = getAvailableSlots(professional, [booking], "2026-04-20", 30)
    expect(slots[0].available).toBe(true)
  })

  it("retorna array vacío cuando el día es libre (null)", () => {
    // 2026-04-25 es sábado: workingHours.saturday = null
    const slots = getAvailableSlots(professional, [], "2026-04-25", 30)
    expect(slots).toHaveLength(0)
  })
})

describe("getNextAvailableSlot", () => {
  it("retorna el primer slot disponible del día de referencia", () => {
    const result = getNextAvailableSlot(professional, [], 30, new Date("2026-04-20"))
    expect(result).not.toBeNull()
    expect(result!.date).toBe("2026-04-20")
    expect(result!.slot.available).toBe(true)
  })

  it("salta al día siguiente si todos los slots del día están ocupados", () => {
    // Slots del lunes 09:00–12:00 con duración 30min: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
    const slotTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
    const bookings: Booking[] = slotTimes.map((start, i) => {
      const [h, m] = start.split(":").map(Number)
      const endMin = h * 60 + m + 30
      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}`
      return {
        id: `b${i}`,
        professionalId: "prof-1",
        serviceId: "svc-1",
        clientName: "X",
        clientPhone: "0",
        date: "2026-04-20",
        startTime: start,
        endTime,
        status: "confirmed" as const,
      }
    })
    const result = getNextAvailableSlot(professional, bookings, 30, new Date("2026-04-20"))
    expect(result).not.toBeNull()
    // Día siguiente disponible es martes 2026-04-21
    expect(result!.date).toBe("2026-04-21")
  })

  it("retorna null si no hay disponibilidad en 14 días", () => {
    // Horario 09:00–12:00, duración 30min → slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
    const slotTimes = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
    const bookings: Booking[] = []
    for (let day = 0; day < 14; day++) {
      const d = new Date("2026-04-20")
      d.setDate(d.getDate() + day)
      const dateStr = d.toISOString().split("T")[0]
      for (let i = 0; i < slotTimes.length; i++) {
        const [h, m] = slotTimes[i].split(":").map(Number)
        const endMin = h * 60 + m + 30
        const endH = Math.floor(endMin / 60)
        const endM = endMin % 60
        const endTime = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
        bookings.push({
          id: `b${day}-${i}`,
          professionalId: "prof-1",
          serviceId: "svc-1",
          clientName: "X",
          clientPhone: "0",
          date: dateStr,
          startTime: slotTimes[i],
          endTime,
          status: "confirmed",
        })
      }
    }
    const result = getNextAvailableSlot(professional, bookings, 30, new Date("2026-04-20"))
    expect(result).toBeNull()
  })
})
