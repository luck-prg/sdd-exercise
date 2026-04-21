"use client"

import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function BookingError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">No pudimos procesar tu reserva</h1>
      <p className="text-sm text-muted-foreground max-w-xs">
        Ocurrió un error al intentar confirmar el turno. Podés reintentar o volver al inicio.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
