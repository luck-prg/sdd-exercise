import Link from "next/link"
import { CheckCircle2, User, Scissors, CalendarDays, Clock } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Booking, Professional, Service } from "@/lib/types"

interface BookingConfirmationProps {
  professional: Professional
  service: Service
  booking: Booking
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
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground leading-snug">{value}</p>
      </div>
    </div>
  )
}

export default function BookingConfirmation({ professional, service, booking }: BookingConfirmationProps) {
  return (
    <Card className="w-full animate-fade-up">
      <CardHeader className="items-center text-center border-b border-border pb-6">
        <CheckCircle2
          size={48}
          strokeWidth={1.5}
          className="text-primary animate-check-reveal"
        />
        <CardTitle className="font-heading italic text-2xl font-bold mt-2 animate-fade-up-1">
          Turno confirmado
        </CardTitle>
        <CardDescription className="animate-fade-up-2">
          Te esperamos. ¡Hasta pronto!
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-5 animate-fade-up-2">
        <DetailRow
          icon={<User size={14} />}
          label="Profesional"
          value={`${professional.name} · ${professional.role}`}
        />
        <Separator />
        <DetailRow
          icon={<Scissors size={14} />}
          label="Servicio"
          value={service.name}
        />
        <Separator />
        <DetailRow
          icon={<CalendarDays size={14} />}
          label="Fecha"
          value={formatDate(booking.date)}
        />
        <Separator />
        <DetailRow
          icon={<Clock size={14} />}
          label="Horario"
          value={`${booking.startTime} — ${booking.endTime}`}
        />
      </CardContent>

      <CardFooter className="animate-fade-up-3">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline" }), "w-full")}
        >
          Volver al inicio
        </Link>
      </CardFooter>
    </Card>
  )
}
