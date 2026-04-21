"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">500</h1>
      <p className="text-muted-foreground">Ocurrió un error inesperado.</p>
      <Button onClick={reset}>Reintentar</Button>
    </main>
  )
}
