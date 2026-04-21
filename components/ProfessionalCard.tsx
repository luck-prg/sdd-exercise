import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import ServiceBadge from "@/components/ServiceBadge"
import type { Professional, Service } from "@/lib/types"

interface ProfessionalCardProps {
  professional: Professional
  services: Service[]
  selectedServiceId: string | null
  onServiceSelect: (professionalId: string, serviceId: string) => void
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function ProfessionalCard({
  professional,
  services,
  selectedServiceId,
  onServiceSelect,
}: ProfessionalCardProps) {
  const profServices = services.filter((s) => professional.serviceIds.includes(s.id))
  const isActive = selectedServiceId !== null

  return (
    <Card
      className={cn(
        "flex flex-col gap-0 transition-all duration-300",
        isActive && "ring-2 ring-primary"
      )}
    >
      <CardHeader className="pb-0 pt-5">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback
              className={cn(
                "font-heading font-bold text-sm transition-colors duration-300",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {getInitials(professional.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-heading font-semibold text-foreground text-base leading-snug">
              {professional.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">
              {professional.role}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 pt-4">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {professional.bio}
        </p>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/60 mb-2">
            Servicios
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profServices.map((service) => (
              <ServiceBadge
                key={service.id}
                service={service}
                selected={selectedServiceId === service.id}
                onSelect={() => onServiceSelect(professional.id, service.id)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
