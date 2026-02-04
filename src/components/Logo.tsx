'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'default' | 'light' | 'dark'
  className?: string
}

// DoctorMX Logo Component v2
// Big blue "D" that's a stethoscope, earpiece cables form "mx"
export function Logo({ 
  size = 'md', 
  showText = true, 
  variant = 'default',
  className 
}: LogoProps) {
  const sizes = {
    sm: { container: 'w-8 h-8', icon: 32, text: 'text-lg' },
    md: { container: 'w-10 h-10', icon: 40, text: 'text-xl' },
    lg: { container: 'w-12 h-12', icon: 48, text: 'text-2xl' },
  }

  const variants = {
    default: 'bg-blue-500',
    light: 'bg-blue-400',
    dark: 'bg-blue-600',
  }

  const textColors = {
    default: 'text-gray-900',
    light: 'text-white',
    dark: 'text-white',
  }

  const s = sizes[size]

  return (
    <Link 
      href="/" 
      className={cn(
        "flex items-center gap-2.5 transition-opacity hover:opacity-90",
        className
      )}
    >
      {/* Logo Container */}
      <div className={cn(
        s.container,
        "rounded-xl flex items-center justify-center relative overflow-visible",
        variants[variant]
      )}>
        <svg 
          width={s.icon} 
          height={s.icon} 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          {/* 
            Big D Stethoscope Concept:
            - The D shape is the stethoscope body/chest piece
            - The straight side is the tubing
            - The curved side is the diaphragm housing
            - Cables from top form "mx"
          */}
          
          {/* Main D - Stethoscope chest piece */}
          <path 
            d="M20 25 
               L20 75 
               C20 88 35 92 45 92
               C70 92 75 70 75 50
               C75 30 70 8 45 8
               C35 8 20 12 20 25Z" 
            fill="white"
          />
          
          {/* Inner diaphragm detail */}
          <ellipse 
            cx="48" 
            cy="50" 
            rx="18" 
            ry="32" 
            fill={variant === 'default' ? '#3B82F6' : variant === 'light' ? '#60A5FA' : '#2563EB'}
            fillOpacity="0.15"
          />
          
          {/* The "mx" formed by stethoscope earpiece cables */}
          {/* "m" - left cable with two humps */}
          <path 
            d="M25 20 
               C25 5 30 5 32 5
               L36 5
               C40 5 40 10 40 15
               C40 20 40 25 44 25
               C48 25 48 20 48 15
               C48 10 48 5 52 5" 
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
          />
          
          {/* "x" - right cable crossing */}
          <path 
            d="M55 5 L68 25 M68 5 L55 25" 
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
          />
          
          {/* Earpiece circles */}
          <circle cx="30" cy="5" r="4" fill="white"/>
          <circle cx="62" cy="5" r="4" fill="white"/>
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <span className={cn(
          s.text,
          "font-semibold tracking-tight",
          textColors[variant]
        )}>
          <span className="font-medium">doctor</span>
          <span className="text-blue-500 font-bold">.mx</span>
        </span>
      )}
    </Link>
  )
}

// Icon only version for favicon/app icon
export function LogoIcon({ 
  size = 32, 
  className 
}: { 
  size?: number
  className?: string 
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect width="100" height="100" rx="22" fill="#3B82F6"/>
      
      {/* D Stethoscope */}
      <path 
        d="M20 25 
           L20 75 
           C20 88 35 92 45 92
           C70 92 75 70 75 50
           C75 30 70 8 45 8
           C35 8 20 12 20 25Z" 
        fill="white"
      />
      
      {/* Inner detail */}
      <ellipse 
        cx="48" 
        cy="50" 
        rx="18" 
        ry="32" 
        fill="#3B82F6"
        fillOpacity="0.2"
      />
      
      {/* mx cables */}
      <path 
        d="M25 20 
           C25 5 30 5 32 5
           L36 5
           C40 5 40 10 40 15
           C40 20 40 25 44 25
           C48 25 48 20 48 15
           C48 10 48 5 52 5" 
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path 
        d="M55 5 L68 25 M68 5 L55 25" 
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
      
      {/* Earpieces */}
      <circle cx="30" cy="5" r="4" fill="white"/>
      <circle cx="62" cy="5" r="4" fill="white"/>
    </svg>
  )
}

export default Logo
