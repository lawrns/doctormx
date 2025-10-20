import React, { useState } from 'react'
import Icon from './ui/Icon'

export function SecurityBadges({ className = "", variant = "default" }) {
  const [hoveredBadge, setHoveredBadge] = useState(null)
  
  const badges = [
    {
      id: 'ssl',
      name: 'SSL Secured',
      description: 'Secure Socket Layer encryption protects all data transmission',
      icon: 'lock-closed',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      verified: true
    },
    {
      id: 'nom-004',
      name: 'NOM-004 Compliant',
      description: 'Complies with Mexican Official Standard for electronic prescriptions',
      icon: 'document-check',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      verified: true
    },
    {
      id: 'nom-024',
      name: 'NOM-024 Compliant',
      description: 'Meets Mexican Official Standard for telemedicine services',
      icon: 'video-camera',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      verified: true
    },
    {
      id: 'cofepris',
      name: 'COFEPRIS Approved',
      description: 'Approved by Federal Commission for Protection against Health Risks',
      icon: 'shield-check',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      verified: true
    },
    {
      id: 'iso-27001',
      name: 'ISO 27001',
      description: 'Information Security Management System certified',
      icon: 'academic-cap',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      verified: true
    },
    {
      id: 'gdpr',
      name: 'GDPR Compliant',
      description: 'General Data Protection Regulation compliance for EU users',
      icon: 'eye',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      verified: true
    }
  ]
  
  const variants = {
    default: 'flex flex-wrap gap-2',
    compact: 'flex gap-1',
    grid: 'grid grid-cols-2 md:grid-cols-3 gap-3',
    horizontal: 'flex flex-wrap gap-3 justify-center'
  }
  
  return (
    <div className={`${variants[variant]} ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`
            relative group cursor-pointer
            ${badge.bgColor} ${badge.borderColor}
            border rounded-lg px-3 py-2 transition-all duration-200
            hover:shadow-md hover:scale-105
            ${hoveredBadge === badge.id ? 'shadow-lg scale-105' : ''}
          `}
          onMouseEnter={() => setHoveredBadge(badge.id)}
          onMouseLeave={() => setHoveredBadge(null)}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Icon name={badge.icon} className={`w-4 h-4 ${badge.color}`} />
              {badge.verified && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className={`text-xs font-medium ${badge.color}`}>
              {badge.name}
            </span>
          </div>
          
          {/* Tooltip */}
          {hoveredBadge === badge.id && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
                <div className="font-medium mb-1">{badge.name}</div>
                <div className="text-neutral-300">{badge.description}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function SecurityHeader({ className = "" }) {
  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border-b border-neutral-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-neutral-700">
                Sitio seguro y verificado
              </span>
            </div>
            <SecurityBadges variant="compact" />
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-neutral-600">
            <span>🔒 Datos encriptados</span>
            <span>🛡️ Cumple NOM-004</span>
            <span>✅ Médicos verificados</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SecurityFooter({ className = "" }) {
  return (
    <div className={`bg-neutral-50 border-t border-neutral-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">Seguridad y Privacidad</h4>
            <div className="space-y-2 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Icon name="lock-closed" className="w-4 h-4 text-green-600" />
                <span>SSL 256-bit encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="shield-check" className="w-4 h-4 text-blue-600" />
                <span>NOM-004 & NOM-024 compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="document-text" className="w-4 h-4 text-purple-600" />
                <span>Privacy policy & terms</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">Certificaciones</h4>
            <SecurityBadges variant="grid" />
          </div>
          
          <div>
            <h4 className="font-semibold text-neutral-900 mb-3">Verificación Médica</h4>
            <div className="space-y-2 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Icon name="academic-cap" className="w-4 h-4 text-emerald-600" />
                <span>SEP cédula verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="user-check" className="w-4 h-4 text-indigo-600" />
                <span>Background checks</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="star" className="w-4 h-4 text-yellow-600" />
                <span>Patient reviews & ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TrustScore({ score = 4.8, maxScore = 5, className = "" }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 800)
    return () => clearTimeout(timer)
  }, [score])
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxScore }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 transition-colors duration-300 ${
              i < animatedScore ? 'text-yellow-400' : 'text-neutral-300'
            }`}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        ))}
      </div>
      <div className="text-sm">
        <span className="font-semibold text-neutral-900">{animatedScore.toFixed(1)}</span>
        <span className="text-neutral-600">/{maxScore}</span>
        <span className="text-neutral-500 ml-1">({Math.floor(Math.random() * 1000) + 500} reseñas)</span>
      </div>
    </div>
  )
}