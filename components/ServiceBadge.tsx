"use client"

import { Badge } from "@/components/ui/badge"
import type { Service } from "@/lib/types"

interface ServiceBadgeProps {
  service: Service
  selected: boolean
  onSelect: () => void
}

export default function ServiceBadge({ service, selected, onSelect }: ServiceBadgeProps) {
  return (
    <button
      type="button"
      data-selected={String(selected)}
      onClick={onSelect}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
    >
      <Badge
        variant={selected ? "default" : "outline"}
        className="h-auto flex-col items-start gap-0.5 py-2 px-3 cursor-pointer select-none transition-colors"
      >
        <span className="text-xs font-medium leading-snug">{service.name}</span>
        <span className="text-[10px] opacity-60 font-normal">
          ${service.price.toLocaleString("es-AR")} · {service.duration} min
        </span>
      </Badge>
    </button>
  )
}
