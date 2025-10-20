import React, { useState, useEffect } from 'react'
import Icon from './ui/Icon'

export function LiveActivityIndicator({ className = "" }) {
  const [activities, setActivities] = useState([
    { id: 1, type: 'consultation', location: 'Ciudad de México', time: 'hace 2 min' },
    { id: 2, type: 'consultation', location: 'Guadalajara', time: 'hace 5 min' },
    { id: 3, type: 'consultation', location: 'Monterrey', time: 'hace 8 min' },
    { id: 4, type: 'consultation', location: 'Puebla', time: 'hace 12 min' }
  ])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = {
          id: Date.now(),
          type: 'consultation',
          location: ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León'][Math.floor(Math.random() * 6)],
          time: 'hace 1 min'
        }
        return [newActivity, ...prev.slice(0, 3)]
      })
    }, 8000 + Math.random() * 4000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
        </div>
        <span className="text-sm font-medium text-neutral-900">Actividad en vivo</span>
      </div>
      
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className="flex items-center gap-2 text-xs text-neutral-600 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Icon name="user" className="w-3 h-3 text-accent-500" />
            <span>Consulta realizada en {activity.location}</span>
            <span className="text-neutral-400">•</span>
            <span>{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PatientTestimonials({ className = "" }) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  
  const testimonials = [
    {
      id: 1,
      name: 'María González',
      location: 'Ciudad de México',
      rating: 5,
      text: 'Excelente servicio, el doctor me ayudó rápidamente con mi problema de migraña. Muy profesional y empático.',
      avatar: 'MG',
      verified: true
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      location: 'Guadalajara',
      rating: 5,
      text: 'La plataforma es muy fácil de usar y los doctores responden súper rápido. Me ahorré horas de espera.',
      avatar: 'CR',
      verified: true
    },
    {
      id: 3,
      name: 'Ana Martínez',
      location: 'Monterrey',
      rating: 5,
      text: 'Mi hijo tenía fiebre y el pediatra nos orientó perfectamente. Muy recomendable para emergencias.',
      avatar: 'AM',
      verified: true
    },
    {
      id: 4,
      name: 'Luis Hernández',
      location: 'Puebla',
      rating: 5,
      text: 'El dermatólogo me ayudó con mi problema de piel. Consulta muy completa y seguimiento excelente.',
      avatar: 'LH',
      verified: true
    }
  ]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])
  
  const current = testimonials[currentTestimonial]
  
  return (
    <div className={`bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="star" className="w-5 h-5 text-yellow-500" />
        <span className="text-sm font-medium text-neutral-900">Reseñas de pacientes</span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-semibold">
            {current.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900">{current.name}</span>
              {current.verified && (
                <Icon name="check-circle" className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="text-sm text-neutral-600">{current.location}</div>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Icon key={i} name="star" className="w-4 h-4 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
        
        <blockquote className="text-sm text-neutral-700 italic">
          "{current.text}"
        </blockquote>
        
        <div className="flex gap-1">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentTestimonial ? 'bg-primary-500' : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function DoctorOnlineStatus({ className = "" }) {
  const [onlineCount, setOnlineCount] = useState(47)
  const [responseTime, setResponseTime] = useState(1.8)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 3) - 1)
      setResponseTime(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 0.2))
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
        </div>
        <span className="text-sm font-medium text-neutral-900">Doctores en línea</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-600">Disponibles ahora</span>
          <span className="text-lg font-bold text-green-600">{onlineCount}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-600">Tiempo de respuesta</span>
          <span className="text-sm font-medium text-neutral-900">{responseTime.toFixed(1)} min</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-600">Consultas hoy</span>
          <span className="text-sm font-medium text-neutral-900">
            {Math.floor(Math.random() * 200) + 800}
          </span>
        </div>
      </div>
    </div>
  )
}

export function TrustMetrics({ className = "" }) {
  const [metrics, setMetrics] = useState({
    patients: 12450,
    consultations: 45600,
    satisfaction: 4.8,
    responseTime: 1.8
  })
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        patients: prev.patients + Math.floor(Math.random() * 5),
        consultations: prev.consultations + Math.floor(Math.random() * 10),
        satisfaction: Math.max(4.5, Math.min(5.0, prev.satisfaction + (Math.random() - 0.5) * 0.1)),
        responseTime: Math.max(0.5, Math.min(3.0, prev.responseTime + (Math.random() - 0.5) * 0.2))
      }))
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary-600">
          {metrics.patients.toLocaleString()}+
        </div>
        <div className="text-xs text-neutral-600">Pacientes</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-accent-600">
          {metrics.consultations.toLocaleString()}+
        </div>
        <div className="text-xs text-neutral-600">Consultas</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">
          {metrics.satisfaction.toFixed(1)}★
        </div>
        <div className="text-xs text-neutral-600">Satisfacción</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {metrics.responseTime.toFixed(1)}min
        </div>
        <div className="text-xs text-neutral-600">Respuesta</div>
      </div>
    </div>
  )
}

export function VerificationProcess({ className = "" }) {
  const steps = [
    {
      id: 1,
      title: 'Verificación SEP',
      description: 'Cédula profesional verificada con la Secretaría de Educación Pública',
      icon: 'academic-cap',
      completed: true
    },
    {
      id: 2,
      title: 'Verificación COFEPRIS',
      description: 'Registro sanitario verificado con COFEPRIS',
      icon: 'shield-check',
      completed: true
    },
    {
      id: 3,
      title: 'Verificación de Identidad',
      description: 'Documentos de identidad verificados',
      icon: 'identification',
      completed: true
    },
    {
      id: 4,
      title: 'Verificación de Experiencia',
      description: 'Experiencia profesional verificada',
      icon: 'briefcase',
      completed: true
    }
  ]
  
  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon name="shield-check" className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-neutral-900">Proceso de verificación</span>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-400'
              }`}>
                <Icon name={step.icon} className="w-4 h-4" />
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-neutral-200" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-neutral-900">{step.title}</div>
              <div className="text-xs text-neutral-600">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
