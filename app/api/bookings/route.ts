import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import type { Booking, CreateBookingInput } from "@/lib/types"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const filePath = join(process.cwd(), "data", "bookings.json")

function readBookings(): Booking[] {
  return JSON.parse(readFileSync(filePath, "utf-8"))
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const professionalId = searchParams.get("professionalId")
  const date = searchParams.get("date")

  let bookings = readBookings()

  if (professionalId) {
    bookings = bookings.filter((b) => b.professionalId === professionalId)
  }
  if (date) {
    bookings = bookings.filter((b) => b.date === date)
  }

  return Response.json(bookings)
}

export async function POST(request: Request) {
  const body: CreateBookingInput = await request.json()
  const { professionalId, serviceId, clientName, clientPhone, date, startTime, endTime } = body

  if (!professionalId || !serviceId || !clientName || !clientPhone || !date || !startTime || !endTime) {
    return Response.json({ error: "Todos los campos son requeridos" }, { status: 400 })
  }

  const bookings = readBookings()

  const conflict = bookings.some(
    (b) =>
      b.professionalId === professionalId &&
      b.date === date &&
      b.status === "confirmed" &&
      b.startTime === startTime
  )

  if (conflict) {
    return Response.json({ error: "El horario ya está reservado" }, { status: 400 })
  }

  const newBooking: Booking = {
    id: `book-${Date.now()}`,
    professionalId,
    serviceId,
    clientName,
    clientPhone,
    date,
    startTime,
    endTime,
    status: "confirmed",
  }

  bookings.push(newBooking)
  writeFileSync(filePath, JSON.stringify(bookings, null, 2), "utf-8")

  return Response.json(newBooking, { status: 201 })
}
