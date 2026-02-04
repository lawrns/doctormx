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
      "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border transition-all duration-500",
      variant === 'subtle' ? "bg-transparent border-transparent" : "bg-white/50 backdrop-blur-sm border-neutral-100 shadow-sm",
      isAI ? "bg-neutral-900 border-white/10" : "",
      isUrgent ? "bg-red-50 border-red-100" : "",
      className
    )}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500",
          isAI ? "bg-blue-600/10 text-blue-400" : 
          isUrgent ? "bg-red-100 text-red-500" :
          "bg-primary-50 text-primary-500"
        )}
      >
        {Icon ? <Icon className="w-8 h-8 sm:w-10 sm:h-10" /> : <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />}
      </motion.div>

      <motion.h3
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "text-xl sm:text-2xl font-bold mb-3 tracking-tight",
          isAI ? "text-white" : 
          isUrgent ? "text-red-900" :
          "text-neutral-900"
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed",
          isAI ? "text-neutral-400" : 
          isUrgent ? "text-red-700" :
          "text-neutral-500"
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
                "h-12 px-6 sm:px-8 rounded-xl font-semibold flex items-center gap-2 transition-all w-full sm:w-auto",
                isAI ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20" : 
                isUrgent ? "bg-red-600 hover:bg-red-500 text-white" :
                "bg-primary-600 hover:bg-primary-700 text-white"
              )}>
                {action.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={action.onClick}
              className={cn(
                "h-12 px-6 sm:px-8 rounded-xl font-semibold flex items-center gap-2 transition-all w-full sm:w-auto",
                isAI ? "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20" : 
                isUrgent ? "bg-red-600 hover:bg-red-500 text-white" :
                "bg-primary-600 hover:bg-primary-700 text-white"
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
              <Button variant="outline" className={cn(
                "h-12 px-6 sm:px-8 rounded-xl font-semibold border-neutral-200 hover:bg-neutral-50 transition-all w-full sm:w-auto",
                isAI ? "border-white/10 text-white hover:bg-white/5" : "",
                isUrgent ? "border-red-200 text-red-700 hover:bg-red-50" : ""
              )}>
                {secondaryAction.label}
              </Button>
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className={cn(
                "h-12 px-6 sm:px-8 rounded-xl font-semibold border-neutral-200 hover:bg-neutral-50 transition-all w-full sm:w-auto",
                isAI ? "border-white/10 text-white hover:bg-white/5" : "",
                isUrgent ? "border-red-200 text-red-700 hover:bg-red-50" : ""
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

// Pre-configured empty states for common scenarios
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
      className="bg-blue-50 border-blue-100"
    >
      <div className="w-full max-w-xs mb-6">
        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: ["0%", "40%", "60%", "80%", "95%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <p className="text-xs text-blue-600 mt-2">Validando con COFEPRIS...</p>
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
