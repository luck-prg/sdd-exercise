import type { Booking, CreateBookingInput, Professional, Service } from "@/lib/types"

const TIMEOUT_MS = 3000

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function getProfessionals(): Promise<Professional[]> {
  const res = await fetchWithTimeout("/api/professionals")
  if (!res.ok) throw new Error("Error al obtener profesionales")
  return res.json()
}

export async function getProfessional(id: string): Promise<Professional> {
  const res = await fetchWithTimeout(`/api/professionals/${id}`)
  if (res.status === 404) throw new Error("Profesional no encontrado")
  if (!res.ok) throw new Error("Error al obtener profesional")
  return res.json()
}

export async function getServices(): Promise<Service[]> {
  const res = await fetchWithTimeout("/api/services")
  if (!res.ok) throw new Error("Error al obtener servicios")
  return res.json()
}

export async function getBookings(professionalId?: string, date?: string): Promise<Booking[]> {
  const params = new URLSearchParams()
  if (professionalId) params.set("professionalId", professionalId)
  if (date) params.set("date", date)
  const query = params.toString() ? `?${params.toString()}` : ""
  const res = await fetchWithTimeout(`/api/bookings${query}`)
  if (!res.ok) throw new Error("Error al obtener reservas")
  return res.json()
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const res = await fetchWithTimeout("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? "Error al crear la reserva")
  }
  return res.json()
}
