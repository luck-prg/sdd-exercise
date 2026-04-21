"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProfessionalCard from "@/components/ProfessionalCard"
import type { Professional, Service } from "@/lib/types"

interface BookingSelectorProps {
  professionals: Professional[]
  services: Service[]
}

export default function BookingSelector({ professionals, services }: BookingSelectorProps) {
  const router = useRouter()
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)

  function handleServiceSelect(professionalId: string, serviceId: string) {
    setSelectedProfessionalId(professionalId)
    setSelectedServiceId(serviceId)
  }

  function handleContinue() {
    if (!selectedProfessionalId || !selectedServiceId) return
    router.push(`/booking/${selectedProfessionalId}?serviceId=${selectedServiceId}`)
  }

  const canContinue = !!selectedProfessionalId && !!selectedServiceId

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {professionals.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            professional={professional}
            services={services}
            selectedServiceId={
              selectedProfessionalId === professional.id ? selectedServiceId : null
            }
            onServiceSelect={handleServiceSelect}
          />
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          size="lg"
          className="gap-2"
        >
          Continuar
          <ArrowRight size={15} className="transition-transform group-hover/button:translate-x-0.5" />
        </Button>
      </div>
    </div>
  )
}
