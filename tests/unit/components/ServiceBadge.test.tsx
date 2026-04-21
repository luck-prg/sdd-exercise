import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ServiceBadge from "@/components/ServiceBadge"

describe("ServiceBadge", () => {
  it("renderiza el nombre del servicio", () => {
    render(<ServiceBadge name="Corte de cabello" selected={false} onSelect={() => {}} />)
    expect(screen.getByText("Corte de cabello")).toBeInTheDocument()
  })

  it("aplica estilos de seleccionado cuando selected=true", () => {
    const { container } = render(
      <ServiceBadge name="Corte de cabello" selected={true} onSelect={() => {}} />
    )
    const badge = container.firstChild as HTMLElement
    expect(badge).toHaveAttribute("data-selected", "true")
  })

  it("no aplica estilos de seleccionado cuando selected=false", () => {
    const { container } = render(
      <ServiceBadge name="Corte de cabello" selected={false} onSelect={() => {}} />
    )
    const badge = container.firstChild as HTMLElement
    expect(badge).toHaveAttribute("data-selected", "false")
  })

  it("llama a onSelect al hacer click", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ServiceBadge name="Corte de cabello" selected={false} onSelect={onSelect} />)
    await user.click(screen.getByText("Corte de cabello"))
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
