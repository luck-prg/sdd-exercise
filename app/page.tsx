import { getProfessionals, getServices } from "@/lib/data"
import BookingSelector from "@/components/BookingSelector"

export default function Home() {
  const professionals = getProfessionals()
  const services = getServices()

  return (
    <main className="mx-auto max-w-5xl px-4 pt-10 pb-16 w-full">
      <div className="mb-10">
        <p
          className="text-[10px] tracking-[0.3em] uppercase font-medium mb-3"
          style={{ color: "var(--brand-amber)" }}
        >
          Reservar turno
        </p>
        <h1 className="font-heading font-bold italic text-3xl text-foreground leading-tight">
          Elegí tu profesional
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Seleccioná un profesional y el servicio que necesitás para continuar.
        </p>
        <div
          className="mt-5 h-px w-10"
          style={{ background: "var(--brand-amber)" }}
        />
      </div>
      <BookingSelector professionals={professionals} services={services} />
    </main>
  )
}
