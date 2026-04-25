'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  CalendarCheck,
  MapPin,
  Star,
  Video,
  Users,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface EnhancedDoctorCardProps {
  id: string
  fullName: string
  specialty: string
  photoUrl?: string | null
  rating?: number | null
  reviewCount?: number | null
  priceCents?: number | null
  currency?: string
  city?: string | null
  state?: string | null
  offersVideo?: boolean
  offersInPerson?: boolean
  nextAvailableSlot?: string | null
  monthlyPatients?: number | null
  verified?: boolean
  className?: string
}

export function EnhancedDoctorCard({
  id,
  fullName,
  specialty,
  photoUrl,
  rating,
  reviewCount,
  priceCents,
  currency = 'MXN',
  city,
  state,
  offersVideo = true,
  offersInPerson = true,
  nextAvailableSlot,
  monthlyPatients,
  verified = false,
  className,
}: EnhancedDoctorCardProps) {
  const location = [city, state].filter(Boolean).join(', ') || null

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-dx-2',
        className
      )}
    >
      <div className="flex gap-4">
        {/* Photo */}
        <Link
          href={`/doctors/${id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted"
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={fullName}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-xl font-semibold">
                {fullName.charAt(0)}
              </span>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={`/doctors/${id}`}
                className="block truncate text-[15px] font-semibold leading-tight tracking-[-0.01em] text-foreground hover:text-primary transition-colors"
              >
                {fullName}
              </Link>
              <p className="mt-0.5 text-sm text-muted-foreground">{specialty}</p>
            </div>
            {rating != null && (
              <div className="flex shrink-0 items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                <span className="text-sm font-semibold text-foreground">
                  {rating.toFixed(1)}
                </span>
                {reviewCount != null && (
                  <span className="text-xs text-muted-foreground">
                    ({reviewCount})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Location + badges */}
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
            {verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                <BadgeCheck className="h-3 w-3" />
                Verificado SEP
              </span>
            )}
          </div>

          {/* Modality badges */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {offersVideo && (
              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
                <Video className="h-3 w-3" />
                Video
              </Badge>
            )}
            {offersInPerson && (
              <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px]">
                <MapPin className="h-3 w-3" />
                Presencial
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Persuasion layer */}
      <div className="mt-4 space-y-2 border-t border-border pt-3">
        {/* Scarcity: next available slot */}
        {nextAvailableSlot && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
            <Clock className="h-3.5 w-3.5" />
            Próxima cita: {nextAvailableSlot}
          </div>
        )}

        {/* Social proof: monthly patients */}
        {monthlyPatients != null && monthlyPatients > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {monthlyPatients} pacientes este mes
          </div>
        )}

        {/* CTA row */}
        <div className="flex items-center justify-between pt-1">
          {priceCents != null ? (
            <div>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(priceCents, currency)}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                por consulta
              </span>
            </div>
          ) : (
            <div />
          )}
          <Button
            asChild
            size="sm"
            className="h-9 rounded-lg bg-primary text-sm font-medium hover:bg-primary/90"
          >
            <Link href={`/book/${id}`} className="gap-1.5">
              <CalendarCheck className="h-3.5 w-3.5" />
              Reservar
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
