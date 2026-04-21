import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

describe("app/not-found.tsx", () => {
  it("muestra 404 y link para volver al inicio", async () => {
    const { default: NotFound } = await import("@/app/not-found")
    render(<NotFound />)
    expect(screen.getByText("404")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /volver/i })).toHaveAttribute("href", "/")
  })
})

describe("app/error.tsx", () => {
  it("muestra 500 y botón de reintentar", async () => {
    const { default: GlobalError } = await import("@/app/error")
    const reset = vi.fn()
    render(<GlobalError error={new Error("test")} reset={reset} />)
    expect(screen.getByText("500")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument()
  })

  it("llama reset al hacer click en Reintentar", async () => {
    const { default: GlobalError } = await import("@/app/error")
    const user = userEvent.setup()
    const reset = vi.fn()
    render(<GlobalError error={new Error("test")} reset={reset} />)
    await user.click(screen.getByRole("button", { name: /reintentar/i }))
    expect(reset).toHaveBeenCalledTimes(1)
  })
})

describe("app/booking/[id]/error.tsx", () => {
  it("muestra mensaje de error de reserva y botones de acción", async () => {
    const { default: BookingError } = await import("@/app/booking/[id]/error")
    const reset = vi.fn()
    render(<BookingError error={new Error("test")} reset={reset} />)
    expect(screen.getByText(/no pudimos procesar/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /volver/i })).toBeInTheDocument()
  })
})
