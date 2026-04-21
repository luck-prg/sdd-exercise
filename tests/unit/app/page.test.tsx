import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import BookingSelector from "@/components/BookingSelector"
import type { Professional, Service } from "@/lib/types"

// BookingSelector es el componente client que recibe professionals y services
const professionals: Professional[] = [
  {
    id: "prof-1",
    name: "Carlos Méndez",
    role: "Barbero Senior",
    bio: "Bio Carlos",
    avatar: "/avatars/carlos.jpg",
    serviceIds: ["svc-1"],
    targetAudience: ["men"],
    workingHours: {
      monday: { start: "09:00", end: "18:00" },
      tuesday: { start: "09:00", end: "18:00" },
      wednesday: { start: "09:00", end: "18:00" },
      thursday: { start: "09:00", end: "18:00" },
      friday: { start: "09:00", end: "18:00" },
      saturday: null,
    },
  },
  {
    id: "prof-2",
    name: "Valentina López",
    role: "Estilista",
    bio: "Bio Valentina",
    avatar: "/avatars/valentina.jpg",
    serviceIds: ["svc-2"],
    targetAudience: ["women"],
    workingHours: {
      monday: null,
      tuesday: { start: "10:00", end: "19:00" },
      wednesday: { start: "10:00", end: "19:00" },
      thursday: { start: "10:00", end: "19:00" },
      friday: { start: "10:00", end: "19:00" },
      saturday: { start: "09:00", end: "15:00" },
    },
  },
]

const services: Service[] = [
  { id: "svc-1", name: "Corte de cabello", duration: 30, price: 500 },
  { id: "svc-2", name: "Coloración", duration: 60, price: 1500 },
]

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }))

describe("BookingSelector (page home)", () => {
  it("renderiza un ProfessionalCard por cada profesional", () => {
    render(<BookingSelector professionals={professionals} services={services} />)
    expect(screen.getByText("Carlos Méndez")).toBeInTheDocument()
    expect(screen.getByText("Valentina López")).toBeInTheDocument()
  })

  it("el botón Continuar está deshabilitado si no hay selección", () => {
    render(<BookingSelector professionals={professionals} services={services} />)
    expect(screen.getByRole("button", { name: /continuar/i })).toBeDisabled()
  })

  it("el botón Continuar se habilita tras seleccionar profesional y servicio", async () => {
    const user = userEvent.setup()
    render(<BookingSelector professionals={professionals} services={services} />)
    await user.click(screen.getByText("Corte de cabello"))
    expect(screen.getByRole("button", { name: /continuar/i })).not.toBeDisabled()
  })
})
