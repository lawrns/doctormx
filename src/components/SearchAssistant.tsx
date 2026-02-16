'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Calendar, 
  MapPin, 
  Stethoscope, 
  ChevronRight, 
  ArrowRight,
  CheckCircle2,
  Brain,
  Video
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Question {
  id: string
  title: string
  description: string
  options: Option[]
}

interface Option {
  id: string
  label: string
  icon: LucideIcon
  value: string
  nextQuestionId?: string
}

const QUESTIONS: Question[] = [
  {
    id: 'who',
    title: '¿Para quién es la consulta?',
    description: 'Ayúdanos a entender quién recibirá la atención médica.',
    options: [
      { id: 'me', label: 'Para mí', icon: Users, value: 'me', nextQuestionId: 'type' },
      { id: 'child', label: 'Para mi hijo/a', icon: Users, value: 'child', nextQuestionId: 'type' },
      { id: 'other', label: 'Para otra persona', icon: Users, value: 'other', nextQuestionId: 'type' },
    ]
  },
  {
    id: 'type',
    title: '¿Qué tipo de consulta prefieres?',
    description: 'Elige la modalidad que mejor se adapte a tus necesidades.',
    options: [
      { id: 'video', label: 'Videoconsulta', icon: Video, value: 'video', nextQuestionId: 'specialty' },
      { id: 'presencial', label: 'Presencial', icon: MapPin, value: 'presencial', nextQuestionId: 'specialty' },
      { id: 'any', label: 'Cualquiera', icon: CheckCircle2, value: 'any', nextQuestionId: 'specialty' },
    ]
  },
  {
    id: 'specialty',
    title: '¿En qué área necesitas ayuda?',
    description: 'Selecciona el motivo principal de tu consulta.',
    options: [
      { id: 'mental', label: 'Salud Mental (Ansiedad, Depresión)', icon: Brain, value: 'psiquiatria', nextQuestionId: 'when' },
      { id: 'general', label: 'Medicina General / Chequeo', icon: Stethoscope, value: 'medicina-general', nextQuestionId: 'when' },
      { id: 'other_spec', label: 'Otras Especialidades', icon: ChevronRight, value: 'any', nextQuestionId: 'when' },
    ]
  },
  {
    id: 'when',
    title: '¿Cuándo necesitas la cita?',
    description: 'Buscaremos doctores con disponibilidad en el rango elegido.',
    options: [
      { id: 'today', label: 'Hoy mismo', icon: Calendar, value: 'today' },
      { id: 'tomorrow', label: 'Mañana', icon: Calendar, value: 'tomorrow' },
      { id: 'week', label: 'Esta semana', icon: Calendar, value: 'week' },
      { id: 'any_time', label: 'Cualquier momento', icon: Calendar, value: 'any' },
    ]
  }
]

export function SearchAssistant() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const handleOptionSelect = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const params = new URLSearchParams()
      if (newAnswers.specialty && newAnswers.specialty !== 'any') {
        params.set('specialty', newAnswers.specialty)
      }
      if (newAnswers.type === 'video') {
        params.set('video', 'true')
      }
      if (newAnswers.when === 'today') {
        params.set('availability', 'today')
      }
      router.push(`/doctores?${params.toString()}`)
    }
  }

  const currentQuestion = QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex justify-between text-sm font-medium text-neutral-400 mb-2">
          <span>Paso {currentStep + 1} de {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">
              {currentQuestion.title}
            </h2>
            <p className="text-lg text-neutral-500">
              {currentQuestion.description}
            </p>
          </div>

          <div className="grid gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                className="group relative flex items-center p-6 bg-white border-2 border-neutral-100 rounded-2xl hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 text-left"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <option.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-lg font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {option.label}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="mt-8 text-neutral-400 hover:text-neutral-600 font-medium flex items-center justify-center w-full transition-colors"
            >
              Volver al paso anterior
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
