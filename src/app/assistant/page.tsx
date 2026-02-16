'use client'

import { SearchAssistant } from '@/components/SearchAssistant'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function AssistantPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#FDFCFB]">
      <Header />
      
      <div className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-100 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Asistente de Búsqueda Inteligente
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight mb-4">
              Encuentra al doctor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">perfecto para ti</span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Responde unas breves preguntas para que podamos recomendarte a los especialistas que mejor se adapten a tus necesidades.
            </p>
          </motion.div>

          <SearchAssistant />
        </div>
      </div>

      <Footer />
    </main>
  )
}
