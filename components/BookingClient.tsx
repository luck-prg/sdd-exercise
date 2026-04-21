"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Scissors, CalendarDays, Clock, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import BookingConfirmation from "@/components/BookingConfirmation"
import { createBooking } from "@/lib/api"
import type { Booking, Professional, Service, Slot } from "@/lib/types"

interface BookingClientProps {
  professional: Professional
  service: Service
  nextSlot: { date: string; slot: Slot } | null
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-4">
      <span className="flex-shrink-0 size-8 rounded-full flex items-center justify-center bg-muted text-brand-teal">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground leading-snug">{value}</p>
      </div>
    </div>
  )
}

export default function BookingClient({ professional, service, nextSlot }: BookingClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!nextSlot) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sin disponibilidad</CardTitle>
          <CardDescription>
            No hay turnos disponibles en los próximos 14 días con este profesional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft size={14} />
            Elegir otro profesional
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (status === "success" && confirmedBooking) {
    return (
      <BookingConfirmation
        professional={professional}
        service={service}
        booking={confirmedBooking}
      />
    )
  }

  async function handleConfirm() {
    if (!nextSlot) return
    setStatus("loading")
    setErrorMessage(null)
    try {
      const booking = await createBooking({
        professionalId: professional.id,
        serviceId: service.id,
        clientName: "Cliente",
        clientPhone: "Sin teléfono",
        date: nextSlot.date,
        startTime: nextSlot.slot.startTime,
        endTime: nextSlot.slot.endTime,
      })
      setConfirmedBooking(booking)
      setStatus("success")
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error al confirmar el turno")
      setStatus("error")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-0.5">
          Resumen
        </p>
        <CardTitle className="font-heading italic text-xl font-semibold">
          Detalle del turno
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-0 p-0">
        <DetailRow
          icon={<User size={14} />}
          label="Profesional"
          value={`${professional.name} · ${professional.role}`}
        />
        <Separator />
        <DetailRow
          icon={<Scissors size={14} />}
          label="Servicio"
          value={`${service.name} · $${service.price.toLocaleString("es-AR")} · ${service.duration} min`}
        />
        <Separator />
        <DetailRow
          icon={<CalendarDays size={14} />}
          label="Fecha"
          value={formatDate(nextSlot.date)}
        />
        <Separator />
        <DetailRow
          icon={<Clock size={14} />}
          label="Horario"
          value={`${nextSlot.slot.startTime} — ${nextSlot.slot.endTime}`}
        />

        <div className="px-4 pb-5 pt-4 flex flex-col gap-3">
          {errorMessage && (
            <div className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {errorMessage}
            </div>
          )}
          <Button
            onClick={handleConfirm}
            disabled={status === "loading"}
            size="lg"
            className="w-full"
          >
            {status === "loading" ? "Confirmando..." : "Confirmar turno"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="w-full text-muted-foreground"
          >
            ← Volver al inicio
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
