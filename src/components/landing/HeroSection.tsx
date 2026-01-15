'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

const soapPulseVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.4 + i * 0.1,
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  }),
}

const floatingVariants = {
  initial: { y: 0 },
  animate: {
    y: [-12, 12, -12],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

const specialties = [
  { name: 'Cardiología', emoji: '❤️' },
  { name: 'Dermatología', emoji: '🧴' },
  { name: 'Ginecología', emoji: '👩‍⚕️' },
  { name: 'Pediatría', emoji: '👶' },
  { name: 'Oftalmología', emoji: '👁️' },
  { name: 'Neurología', emoji: '🧠' },
]

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (location) params.set('location', location)
    router.push(`/doctors?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden bg-surface pt-24 pb-16">
      {/* Doctronic Beige Background with Subtle Texture */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-surface" />

        {/* Animated Gradient Blobs - Softer Doctronic colors */}
        <motion.div
          className="absolute top-10 left-[5%] w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -25, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 right-[8%] w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <Badge className="bg-primary-50 text-primary-600 border border-primary-200 hover:bg-primary-100">
            ✨ AI-Powered Medical Consultations
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-center text-5xl sm:text-6xl lg:text-7xl font-serif text-text-primary mb-6 leading-tight"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          Your{' '}
          <span className="bg-gradient-to-r from-primary-500 via-primary-400 to-primary-600 bg-clip-text text-transparent">
            personal AI doctor
          </span>
          , available 24/7
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-center text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto mb-12"
        >
          Get instant medical consultations, AI-powered second opinions, and connect with licensed specialists. All for a fraction of traditional healthcare costs.
        </motion.p>

        {/* CTA Buttons with Shimmer */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/auth/register">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
                <span className="relative z-10 flex items-center gap-2">
                  Get Started Free
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </button>
            </motion.div>
          </Link>

          <Link href="/app/second-opinion">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="px-8 py-4 border-2 border-primary-300 text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors">
                Try AI Second Opinion
              </button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Search Box */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSearch}
          className="relative max-w-3xl mx-auto mb-16 bg-surface-elevated rounded-2xl shadow-lg overflow-hidden border border-neutral-200"
        >
          <div className="flex flex-col sm:flex-row gap-0">
            <div className="flex-1 border-b sm:border-b-0 sm:border-r border-neutral-200 p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="What specialty do you need?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-muted"
              />
            </div>
            <div className="flex-1 p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <input
                type="text"
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-muted"
              />
            </div>
            <div className="p-4">
              <button
                type="submit"
                className="w-full h-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow px-6"
              >
                Search
              </button>
            </div>
          </div>
        </motion.form>

        {/* Stats with SOAP Animations */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {[
            { label: 'Active Doctors', value: '500+' },
            { label: 'Consultations', value: '50K+' },
            { label: 'Patient Satisfaction', value: '98%' },
            { label: 'Response Time', value: '< 2 min' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={soapPulseVariants}
              initial="hidden"
              animate="visible"
              className="text-center p-4 rounded-xl bg-surface-elevated border border-neutral-200 hover:border-primary-300 transition-colors"
            >
              <p className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1">{stat.value}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Pills */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mb-12">
          {specialties.map((specialty) => (
            <motion.button
              key={specialty.name}
              whileHover={{ scale: 1.1, y: -2 }}
              className="px-4 py-2 rounded-full bg-surface-elevated border border-neutral-200 text-text-primary font-medium hover:border-primary-300 transition-colors flex items-center gap-2"
            >
              <span>{specialty.emoji}</span>
              {specialty.name}
            </motion.button>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-text-secondary font-medium">Licensed & Verified Doctors</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-neutral-300" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-text-secondary font-medium">HIPAA Compliant & Secure</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-neutral-300" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-text-secondary font-medium">24/7 AI Support</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Doctor Card - Right side */}
      <motion.div
        className="absolute top-32 right-8 hidden lg:block"
        variants={floatingVariants}
        animate="animate"
      >
        <div className="bg-surface-elevated rounded-2xl p-4 shadow-xl border border-neutral-200 w-80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-primary">Dr. Maria Lopez</p>
              <p className="text-sm text-text-secondary">Cardiologist</p>
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-4">Available now for consultation</p>
          <button className="w-full py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
            Book Appointment
          </button>
        </div>
      </motion.div>
    </section>
  )
}
