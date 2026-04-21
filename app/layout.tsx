import type { Metadata } from "next"
import { Playfair_Display, DM_Sans } from "next/font/google"
import Link from "next/link"
import { Scissors } from "lucide-react"
import "./globals.css"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Lucho's Barber",
  description: "Reservá tu turno en Lucho's Barber",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${dmSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-2.5 group">
              <span className="font-heading font-bold italic text-foreground text-xl leading-none tracking-tight">
                Lucho&apos;s
              </span>
              <span
                className="text-[10px] tracking-[0.4em] uppercase font-medium leading-none"
                style={{ color: "var(--brand-amber)" }}
              >
                Barber
              </span>
            </Link>
            <Scissors
              size={16}
              className="opacity-30"
              style={{ color: "var(--brand-tan)" }}
            />
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
