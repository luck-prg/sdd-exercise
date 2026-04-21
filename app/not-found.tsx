import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">La página que buscás no existe.</p>
      <Link href="/" className={buttonVariants()}>Volver al inicio</Link>
    </main>
  )
}
