import { notFound } from "next/navigation"
import { getProfessional, getServices, getBookings, getService } from "@/lib/data"
import { getNextAvailableSlot } from "@/lib/slots"
import BookingClient from "@/components/BookingClient"

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ serviceId?: string }>
}) {
  const { id } = await params
  const { serviceId } = await searchParams

  const professional = getProfessional(id)
  if (!professional) notFound()

  if (!serviceId) notFound()

  const service = getService(serviceId)
  if (!service) notFound()

  const bookings = getBookings(id)
  const nextSlot = getNextAvailableSlot(professional, bookings, service.duration)

  return (
    <main className="mx-auto max-w-lg px-4 pt-10 pb-16 w-full">
      <div className="mb-10">
        <p
          className="text-[10px] tracking-[0.3em] uppercase font-medium mb-3"
          style={{ color: "var(--brand-amber)" }}
        >
          Confirmación
        </p>
        <h1 className="font-heading font-bold italic text-3xl text-foreground leading-tight">
          Confirmá tu turno
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Te asignamos el próximo horario disponible.
        </p>
        <div
          className="mt-5 h-px w-10"
          style={{ background: "var(--brand-amber)" }}
        />
      </div>
      <BookingClient professional={professional} service={service} nextSlot={nextSlot} />
    </main>
  )
}
