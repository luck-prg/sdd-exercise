import { readFileSync } from "fs"
import { join } from "path"
import type { Booking, Professional, Service } from "@/lib/types"

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "data", filename), "utf-8"))
}

export function getProfessionals(): Professional[] {
  return readJSON<Professional[]>("professionals.json")
}

export function getProfessional(id: string): Professional | undefined {
  return getProfessionals().find((p) => p.id === id)
}

export function getServices(): Service[] {
  return readJSON<Service[]>("services.json")
}

export function getService(id: string): Service | undefined {
  return getServices().find((s) => s.id === id)
}

export function getBookings(professionalId?: string, date?: string): Booking[] {
  let bookings = readJSON<Booking[]>("bookings.json")
  if (professionalId) bookings = bookings.filter((b) => b.professionalId === professionalId)
  if (date) bookings = bookings.filter((b) => b.date === date)
  return bookings
}
