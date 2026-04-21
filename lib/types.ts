export type Service = {
  id: string
  name: string
  duration: number
  price: number
}

export type WorkingDay = { start: string; end: string } | null

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"

export type Professional = {
  id: string
  name: string
  role: string
  bio: string
  avatar: string
  serviceIds: string[]
  workingHours: Record<WeekDay, WorkingDay>
}

export type BookingStatus = "confirmed" | "cancelled"

export type Booking = {
  id: string
  professionalId: string
  serviceId: string
  clientName: string
  clientPhone: string
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
}

export type Slot = {
  startTime: string
  endTime: string
  available: boolean
}

export type CreateBookingInput = {
  professionalId: string
  serviceId: string
  clientName: string
  clientPhone: string
  date: string
  startTime: string
  endTime: string
}
