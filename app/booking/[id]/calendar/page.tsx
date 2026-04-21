import { notFound } from "next/navigation"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getProfessional, getService, getBookings } from "@/lib/data"
import { getAvailableSlots } from "@/lib/slots"

export default async function CalendarPage({
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

  const service = serviceId ? getService(serviceId) : undefined
  if (!service) notFound()

  const today = new Date().toISOString().split("T")[0]
  const bookings = getBookings(id)
  const slots = getAvailableSlots(professional, bookings, today, service.duration)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Elegí un turno</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {professional.name} · {service.name}
        </p>
      </div>

      {/* TODO: implementar calendario de slots (ejercicio SDD) */}
      <div data-slots={JSON.stringify(slots)} className="hidden" />

      <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
        Volver al inicio
      </Link>
    </main>
  )
}
