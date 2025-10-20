import React, { useState, useEffect } from 'react'

// Skeleton loading component for premium feel
export function SkeletonLoader({ className = "", lines = 3, width = "full" }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`bg-neutral-200 rounded-lg h-4 mb-2 ${
            i === lines - 1 ? `w-${width}` : 'w-full'
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            width: i === lines - 1 ? '60%' : '100%'
          }}
        />
      ))}
    </div>
  )
}

// Floating action button with micro-interactions
export function FloatingActionButton({ children, onClick, className = "" }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-6 right-6 z-50
        bg-gradient-to-r from-primary-600 to-primary-500
        text-white rounded-full p-4 shadow-lg
        transition-all duration-300 ease-out
        hover:shadow-xl hover:scale-110
        active:scale-95
        ${isHovered ? 'shadow-primary-500/25' : ''}
        ${className}
      `}
      style={{
        transform: isHovered ? 'translateY(-2px) scale(1.1)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? '0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.1)'
          : '0 10px 15px -3px rgba(99, 102, 241, 0.2)'
      }}
    >
      {children}
    </button>
  )
}

// Trust badge with subtle pulse animation
export function TrustBadge({ icon, text, verified = true, className = "" }) {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), Math.random() * 1000)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        bg-white border border-neutral-200 shadow-sm
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        ${className}
      `}
      style={{
        animation: verified ? 'trustPulse 3s ease-in-out infinite' : 'none'
      }}
    >
      <div className="relative">
        <div className="w-5 h-5 text-accent-600">{icon}</div>
        {verified && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
        )}
      </div>
      <span className="text-xs font-medium text-neutral-700">{text}</span>
    </div>
  )
}

// Live activity indicator
export function LiveActivityIndicator({ activity, className = "" }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3) + 1)
    }, 2000 + Math.random() * 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
      </div>
      <span className="text-xs text-neutral-600">
        {activity.replace('{count}', count.toLocaleString())}
      </span>
    </div>
  )
}

// Progress indicator with smooth animation
export function ProgressIndicator({ progress, label, className = "" }) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress)
    }, 500)
    return () => clearTimeout(timer)
  }, [progress])
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-xs text-neutral-600">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>
    </div>
  )
}

// Verification status with checkmark animation
export function VerificationStatus({ verified, label, className = "" }) {
  const [showCheckmark, setShowCheckmark] = useState(false)
  
  useEffect(() => {
    if (verified) {
      const timer = setTimeout(() => setShowCheckmark(true), 300)
      return () => clearTimeout(timer)
    }
  }, [verified])
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {verified ? (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            {showCheckmark && (
              <svg
                className="w-3 h-3 text-white animate-checkmark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        ) : (
          <div className="w-5 h-5 bg-neutral-300 rounded-full" />
        )}
      </div>
      <span className={`text-sm ${verified ? 'text-green-700' : 'text-neutral-500'}`}>
        {label}
      </span>
    </div>
  )
}

// Floating notification with slide-in animation
export function FloatingNotification({ 
  type = 'success', 
  message, 
  isVisible, 
  onClose,
  className = "" 
}) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose?.()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])
  
  if (!isVisible) return null
  
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }
  
  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm
        p-4 rounded-lg border shadow-lg
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${typeStyles[type]}
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-current opacity-50 hover:opacity-75 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Trust score indicator with animated counter
export function TrustScoreIndicator({ score, maxScore = 5, className = "" }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score)
    }, 800)
    return () => clearTimeout(timer)
  }, [score])
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: maxScore }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 transition-colors duration-300 ${
              i < animatedScore ? 'text-yellow-400' : 'text-neutral-300'
            }`}
            style={{
              transitionDelay: `${i * 0.1}s`
            }}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        ))}
      </div>
      <span className="text-sm font-medium text-neutral-700">
        {animatedScore.toFixed(1)}/{maxScore}
      </span>
    </div>
  )
}

// Add custom keyframes to CSS
const styles = `
@keyframes trustPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes checkmark {
  0% { stroke-dasharray: 0 20; }
  100% { stroke-dasharray: 20 0; }
}

.animate-checkmark {
  animation: checkmark 0.3s ease-in-out;
}
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
