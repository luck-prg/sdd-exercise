import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProfessionalCard from "@/components/ProfessionalCard"
import type { Professional, Service } from "@/lib/types"

const professional: Professional = {
  id: "prof-1",
  name: "Carlos Méndez",
  role: "Barbero Senior",
  bio: "10 años de experiencia.",
  avatar: "/avatars/carlos.jpg",
  serviceIds: ["svc-1", "svc-2"],
  targetAudience: ["men"],
  workingHours: {
    monday:    { start: "09:00", end: "18:00" },
    tuesday:   { start: "09:00", end: "18:00" },
    wednesday: { start: "09:00", end: "18:00" },
    thursday:  { start: "09:00", end: "18:00" },
    friday:    { start: "09:00", end: "18:00" },
    saturday:  null,
  },
}

const services: Service[] = [
  { id: "svc-1", name: "Corte de cabello", duration: 30, price: 500 },
  { id: "svc-2", name: "Corte + barba", duration: 45, price: 800 },
]

describe("ProfessionalCard", () => {
  it("renderiza nombre, rol y bio del profesional", () => {
    render(
      <ProfessionalCard
        professional={professional}
        services={services}
        selectedServiceId={null}
        onServiceSelect={() => {}}
      />
    )
    expect(screen.getByText("Carlos Méndez")).toBeInTheDocument()
    expect(screen.getByText("Barbero Senior")).toBeInTheDocument()
    expect(screen.getByText("10 años de experiencia.")).toBeInTheDocument()
  })

  it("renderiza un ServiceBadge por cada servicio del profesional", () => {
    render(
      <ProfessionalCard
        professional={professional}
        services={services}
        selectedServiceId={null}
        onServiceSelect={() => {}}
      />
    )
    expect(screen.getByText("Corte de cabello")).toBeInTheDocument()
    expect(screen.getByText("Corte + barba")).toBeInTheDocument()
  })

  it("emite callback onServiceSelect con el serviceId al clickear un badge", async () => {
    const user = userEvent.setup()
    const onServiceSelect = vi.fn()
    render(
      <ProfessionalCard
        professional={professional}
        services={services}
        selectedServiceId={null}
        onServiceSelect={onServiceSelect}
      />
    )
    await user.click(screen.getByText("Corte de cabello"))
    expect(onServiceSelect).toHaveBeenCalledWith("prof-1", "svc-1")
  })
})
