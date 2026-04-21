import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getProfessionals,
  getProfessional,
  getServices,
  getBookings,
  createBooking,
} from "@/lib/api"

const mockProfessionals = [{ id: "prof-1", name: "Carlos" }]
const mockServices = [{ id: "svc-1", name: "Corte", duration: 30, price: 500 }]
const mockBookings = [{ id: "book-1", professionalId: "prof-1" }]
const mockBooking = { id: "new-1", professionalId: "prof-1", status: "confirmed" }

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("getProfessionals", () => {
  it("retorna lista de profesionales", async () => {
    vi.stubGlobal("fetch", mockFetch(mockProfessionals))
    const result = await getProfessionals()
    expect(result).toEqual(mockProfessionals)
    expect(fetch).toHaveBeenCalledWith("/api/professionals", expect.any(Object))
  })

  it("lanza error cuando la respuesta no es ok", async () => {
    vi.stubGlobal("fetch", mockFetch({}, 500))
    await expect(getProfessionals()).rejects.toThrow()
  })
})

describe("getProfessional", () => {
  it("retorna un profesional por id", async () => {
    vi.stubGlobal("fetch", mockFetch(mockProfessionals[0]))
    const result = await getProfessional("prof-1")
    expect(result).toEqual(mockProfessionals[0])
  })

  it("lanza error específico en 404", async () => {
    vi.stubGlobal("fetch", mockFetch({}, 404))
    await expect(getProfessional("no-existe")).rejects.toThrow("Profesional no encontrado")
  })
})

describe("getServices", () => {
  it("retorna lista de servicios", async () => {
    vi.stubGlobal("fetch", mockFetch(mockServices))
    const result = await getServices()
    expect(result).toEqual(mockServices)
  })

  it("lanza error cuando la respuesta no es ok", async () => {
    vi.stubGlobal("fetch", mockFetch({}, 500))
    await expect(getServices()).rejects.toThrow()
  })
})

describe("getBookings", () => {
  it("llama sin query params cuando no se pasan argumentos", async () => {
    vi.stubGlobal("fetch", mockFetch(mockBookings))
    await getBookings()
    expect(fetch).toHaveBeenCalledWith("/api/bookings", expect.any(Object))
  })

  it("construye query params con professionalId y date", async () => {
    vi.stubGlobal("fetch", mockFetch(mockBookings))
    await getBookings("prof-1", "2026-04-22")
    expect(fetch).toHaveBeenCalledWith(
      "/api/bookings?professionalId=prof-1&date=2026-04-22",
      expect.any(Object)
    )
  })

  it("lanza error cuando la respuesta no es ok", async () => {
    vi.stubGlobal("fetch", mockFetch({}, 500))
    await expect(getBookings()).rejects.toThrow()
  })
})

describe("createBooking", () => {
  const input = {
    professionalId: "prof-1",
    serviceId: "svc-1",
    clientName: "Juan",
    clientPhone: "123",
    date: "2026-04-22",
    startTime: "10:00",
    endTime: "10:30",
  }

  it("retorna el booking creado en éxito", async () => {
    vi.stubGlobal("fetch", mockFetch(mockBooking, 201))
    const result = await createBooking(input)
    expect(result).toEqual(mockBooking)
    expect(fetch).toHaveBeenCalledWith(
      "/api/bookings",
      expect.objectContaining({ method: "POST" })
    )
  })

  it("lanza error con mensaje del servidor en fallo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: "El horario ya está reservado" }),
      })
    )
    await expect(createBooking(input)).rejects.toThrow("El horario ya está reservado")
  })
})
