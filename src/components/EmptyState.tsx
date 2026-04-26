'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { LucideIcon, Sparkles, ArrowRight, Calendar, ClipboardList, FileText, Clock, User, Search, MessageSquare, Wallet, Stethoscope, Bot, ImageIcon, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  calendar: Calendar,
  clipboard: ClipboardList,
  file: FileText,
  clock: Clock,
  user: User,
  search: Search,
  message: MessageSquare,
  wallet: Wallet,
  doctor: Stethoscope,
  bot: Bot,
  image: ImageIcon,
  alert: AlertCircle,
}

interface EmptyStateProps {
  iconName?: string
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  variant?: 'default' | 'subtle' | 'ai' | 'urgent'
  children?: React.ReactNode
}

export function EmptyState({
  iconName,
  title,
  description,
  action,
  secondaryAction,
  className,
  variant = 'default',
  children,
}: EmptyStateProps) {
  const isAI = variant === 'ai'
  const isUrgent = variant === 'urgent'
  const Icon = iconName ? iconMap[iconName] : null

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-5 sm:p-6 text-center rounded-[12px] border transition-all duration-300",
      variant === 'subtle' ? "bg-transparent border-transparent" : "bg-card border-border shadow-[var(--card-shadow)]",
      isAI ? "bg-ink border-border/20" : "",
      isUrgent ? "bg-destructive/5 border-destructive/20" : "",
      className
    )}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-[8px] transition-transform duration-300",
          isAI ? "bg-primary/10 text-primary" :
          isUrgent ? "bg-destructive/10 text-destructive" :
          "bg-[hsl(var(--trust))]/10 text-[hsl(var(--trust))]"
        )}
      >
        {Icon ? <Icon className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </motion.div>

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "mb-2 text-[17px] font-semibold leading-6 tracking-[-0.02em]",
          isAI ? "text-foreground" :
          isUrgent ? "text-destructive" :
          "text-foreground"
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "mb-5 max-w-md text-sm leading-6",
          isAI ? "text-muted-foreground" :
          isUrgent ? "text-destructive/80" :
          "text-muted-foreground"
        )}
      >
        {description}
      </motion.p>

      {children}

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button className={cn(
                "h-10 rounded-[8px] px-4 font-semibold flex items-center gap-2 transition-all w-full sm:w-auto",
                isAI ? "bg-primary hover:bg-primary/90 text-primary-foreground" :
                isUrgent ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" :
                "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}>
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className={cn(
                "h-10 rounded-[8px] px-4 font-semibold flex items-center gap-2 transition-all w-full sm:w-auto",
                isAI ? "bg-primary hover:bg-primary/90 text-primary-foreground" :
                isUrgent ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" :
                "bg-primary hover:bg-primary/90 text-primary-foreground"
              )}
            >
              {action.label}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )
        )}

        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href}>
              <Button variant="secondary" className={cn(
                "h-10 rounded-[8px] px-4 font-semibold border-border hover:bg-secondary transition-all w-full sm:w-auto",
                isAI ? "border-border/30 text-foreground hover:bg-secondary" : "",
                isUrgent ? "border-destructive/30 text-destructive hover:bg-destructive/5" : ""
              )}>
                {secondaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className={cn(
                "h-10 rounded-[8px] px-4 font-semibold border-border hover:bg-secondary transition-all w-full sm:w-auto",
                isAI ? "border-border/30 text-foreground hover:bg-secondary" : "",
                isUrgent ? "border-destructive/30 text-destructive hover:bg-destructive/5" : ""
              )}
            >
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

export function NoAppointmentsEmpty({ type = 'patient' }: { type?: 'patient' | 'doctor' }) {
  if (type === 'doctor') {
    return (
      <EmptyState
        iconName="calendar"
        title="No tienes consultas programadas"
        description="Las citas aparecerán aquí cuando los pacientes reserven contigo. Comparte tu perfil para empezar a recibir pacientes."
        action={{ label: "Ver mi perfil público", href: "#" }}
        secondaryAction={{ label: "Configurar disponibilidad", href: "/doctor/availability" }}
      />
    )
  }

  return (
    <EmptyState
      iconName="calendar"
      title="No tienes consultas programadas"
      description="Tu primera consulta está a un clic. ¿Prefieres hablar con nuestro asistente IA primero?"
      action={{ label: "Consulta IA Gratis", href: "/app/ai-consulta" }}
      secondaryAction={{ label: "Buscar doctor", href: "/doctors" }}
    />
  )
}

export function NoDoctorsOnlineEmpty() {
  return (
    <EmptyState
      iconName="doctor"
      title="No hay doctores disponibles ahora"
      description="3 médicos regresan a las 8 PM. ¿Mientras tanto, puedo ayudarte con el Dr. Simeon?"
      variant="ai"
      action={{ label: "Chat con Dr. Simeon", href: "/app/ai-consulta" }}
      secondaryAction={{ label: "Programar para mañana", href: "/doctors" }}
    />
  )
}

export function LowConfidenceAIEmpty() {
  return (
    <EmptyState
      iconName="alert"
      title="Necesito un doctor humano"
      description="El Dr. Simeon está aprendiendo sobre estos síntomas. Te conecto con un doctor humano certificado."
      variant="urgent"
      action={{ label: "Ver doctores disponibles", href: "/doctors" }}
      secondaryAction={{ label: "Continuar con IA", href: "/app/ai-consulta" }}
    />
  )
}

export function NoSearchResultsEmpty({ searchTerm }: { searchTerm?: string }) {
  return (
    <EmptyState
      iconName="search"
      title={searchTerm ? `No encontramos "${searchTerm}"` : "No encontramos resultados"}
      description="Ningún doctor con esa especialidad está disponible ahora. ¿Quieres que te sugiera especialistas similares?"
      action={{ label: "Ver especialidades", href: "/specialties" }}
      secondaryAction={{ label: "Consulta con IA", href: "/app/ai-consulta" }}
    />
  )
}

export function PrescriptionPendingEmpty() {
  return (
    <EmptyState
      iconName="file"
      title="Generando tu receta..."
      description="Estamos validando la receta con nuestros estándares de calidad. Esto toma solo unos segundos."
      className="bg-primary/5 border-primary/20"
    >
      <div className="w-full max-w-xs mb-6">
        <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "40%", "60%", "80%", "95%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-primary mt-2">Validando con COFEPRIS...</p>
      </div>
    </EmptyState>
  )
}

export function ConsultationEndedEmpty() {
  return (
    <EmptyState
      iconName="clipboard"
      title="¡Consulta completada!"
      description="Tu receta está lista. ¿Necesitas que te ayude a encontrar una farmacia cercana?"
      action={{ label: "Ver receta", href: "#" }}
      secondaryAction={{ label: "Farmacias cercanas", href: "#" }}
    />
  )
}
