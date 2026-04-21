import { describe, it, expect } from "vitest"
import {
  getProfessionals,
  getProfessional,
  getServices,
  getService,
  getBookings,
} from "@/lib/data"

// Estos tests leen los archivos JSON reales de data/
// Si los datos cambian, los tests deben actualizarse
describe("lib/data — integración con archivos JSON", () => {
  describe("getProfessionals", () => {
    it("retorna al menos 3 profesionales", () => {
      const result = getProfessionals()
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it("cada profesional tiene los campos requeridos", () => {
      const professionals = getProfessionals()
      for (const p of professionals) {
        expect(p).toHaveProperty("id")
        expect(p).toHaveProperty("name")
        expect(p).toHaveProperty("serviceIds")
        expect(p).toHaveProperty("targetAudience")
        expect(p).toHaveProperty("workingHours")
      }
    })
  })

  describe("getProfessional", () => {
    it("retorna el profesional prof-1 por id", () => {
      const p = getProfessional("prof-1")
      expect(p).toBeDefined()
      expect(p?.id).toBe("prof-1")
    })

    it("retorna undefined para un id que no existe", () => {
      expect(getProfessional("no-existe")).toBeUndefined()
    })
  })

  describe("getServices", () => {
    it("retorna al menos 6 servicios", () => {
      const result = getServices()
      expect(result.length).toBeGreaterThanOrEqual(6)
    })

    it("cada servicio tiene los campos requeridos", () => {
      const services = getServices()
      for (const s of services) {
        expect(s).toHaveProperty("id")
        expect(s).toHaveProperty("name")
        expect(typeof s.duration).toBe("number")
        expect(typeof s.price).toBe("number")
      }
    })
  })

  describe("getService", () => {
    it("retorna el servicio svc-1 por id", () => {
      const s = getService("svc-1")
      expect(s).toBeDefined()
      expect(s?.name).toBe("Corte de cabello")
    })

    it("retorna undefined para un id que no existe", () => {
      expect(getService("no-existe")).toBeUndefined()
    })
  })

  describe("getBookings", () => {
    it("retorna array (vacío o con datos)", () => {
      const result = getBookings()
      expect(Array.isArray(result)).toBe(true)
    })

    it("filtra correctamente por professionalId", () => {
      const all = getBookings()
      const filtered = getBookings("prof-1")
      expect(filtered.every((b) => b.professionalId === "prof-1")).toBe(true)
      expect(filtered.length).toBeLessThanOrEqual(all.length)
    })

    it("filtra correctamente por date", () => {
      const all = getBookings()
      if (all.length > 0) {
        const date = all[0].date
        const filtered = getBookings(undefined, date)
        expect(filtered.every((b) => b.date === date)).toBe(true)
      }
    })

    it("filtra por professionalId y date combinados", () => {
      const all = getBookings()
      if (all.length > 0) {
        const { professionalId, date } = all[0]
        const filtered = getBookings(professionalId, date)
        expect(filtered.every((b) => b.professionalId === professionalId && b.date === date)).toBe(true)
      }
    })
  })
})
